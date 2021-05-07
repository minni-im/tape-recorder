import nano from "nano";

const DEFAULT_LOCALHOST_COUCHDB = "http://localhost:5984";

function normalise(schema) {
	Object.keys(schema).forEach((key) => {
		const property = schema[key];
		if (typeof property === "object" && property !== null) {
			const { default: defaultValue } = property;
			if (!defaultValue) {
				schema[key].default = undefined;
			} else if (typeof defaultValue === "function") {
				schema[key].default = defaultValue;
			} else {
				schema[key].default = () => defaultValue;
			}
		} else {
			schema[key] = {
				type: schema[key],
				default: undefined,
			};
		}
	});
	return schema;
}

function assertDesignDocNotInserted(schema) {
	if (schema.designInserted) {
		throw new Error(`[Recorder] can not alter schema after design insertion to database`);
	}
}

/**
 * Represents a schema for a document
 */
class Schema {
	/**
	 * @param {SchemaDefinition} schema
	 * @param {nano.DocumentScope<any>} db
	 */
	constructor(schema = {}, db) {
		/** @type {SchemaDefinition} */
		this.schema = normalise(schema);

		this.methods = {};
		this.statics = {};
		this.virtuals = {};
		this.views = {};

		this.designInserted = false;

		/**
		 * @property {nano.DocumentScope<any>} db
		 */
		Object.defineProperty(this, "db", {
			enumerable: false,
			writable: false,
			value: db,
		});
	}

	/**
	 * Defines a single method, or a group of methods
	 * @param {string|Object<string,Function>} methodName Name of the method(s) to add
	 * @param {Function=} fn The method implementation
	 * @returns Schema
	 */
	method(methodName, fn) {
		assertDesignDocNotInserted(this);
		if (typeof methodName !== "string") {
			this.methods = { ...this.methods, ...methodName };
		} else {
			this.methods[methodName] = fn;
		}
		return this;
	}

	/**
	 * Defines a single static method, or a group of static methods
	 * @param {string|Object<string,Function>} methodName Name of the method(s) to add
	 * @param {Function=} fn The method implementation
	 * @returns Schema
	 */
	static(methodName, fn) {
		assertDesignDocNotInserted(this);
		if (typeof methodName !== "string") {
			this.statics = { ...this.statics, ...methodName };
		} else {
			this.statics[methodName] = fn;
		}
		return this;
	}

	/**
	 * Create a computed property
	 * @param {string} virtualName The name of the property
	 * @param {Function} get Getter function
	 * @param {Function=} set Setter function
	 * @returns Schema
	 */
	virtual(virtualName, get, set) {
		assertDesignDocNotInserted(this);
		if (typeof virtualName !== "string") {
			Object.keys(virtualName).forEach((name) => {
				this.virtuals[name] = {
					get: virtualName[name].get,
				};
				if (virtualName[name].set) {
					this.virtuals[name].set = virtualName[name].set;
				}
			});
		} else {
			this.virtuals[virtualName] = { get };
			if (set) {
				this.virtuals[virtualName].set = set;
			}
		}
		return this;
	}

	/**
	 * Defines a custom view
	 * @param {string} viewName The name of the view
	 * @param {{map: Function, reduce?: Function}} viewDefinition Map/reduce couple methods for the view
	 * @returns Schema
	 */
	view(viewName, viewDefinition) {
		assertDesignDocNotInserted(this);
		if (viewDefinition.map) {
			viewDefinition.map = viewDefinition.map.toString();
		}
		if (viewDefinition.reduce) {
			viewDefinition.reduce = viewDefinition.reduce.toString();
		}
		this.views[viewName] = viewDefinition;
		return this;
	}

	/**
	 * All the property names of the schema
	 * @property {string[]} names
	 */
	get names() {
		return Object.keys(this.schema);
	}

	/**
	 * Returns the default value, if any of a property of the schema
	 * @param {string} property
	 */
	defaultValue(property) {
		return this.schema[property].default && this.schema[property].default();
	}

	/**
	 * Persist the design document of this schema to the database
	 * @param {string} modelName
	 * @returns
	 */
	async updateDesignDoc(modelName) {
		if (this.designInserted) {
			return;
		}

		// default "all" view
		this.view("all", {
			map: `function(doc) { if (doc.modelType === "${modelName}") { emit(doc._id, null); } }`,
		});

		// "${property}/_all" views
		this.names.forEach((property) => {
			if (this.schema[property].view === true) {
				this.view(property, {
					map: `function(doc) { if (doc.modelType === "${modelName}" && doc.${property}) { emit(doc.${property}, null); } }`,
				});
			}
		});

		// Persisting to DB _design document
		const id = `_design/${modelName}`;
		let designDocument;
		try {
			designDocument = await this.db.get(id);
		} catch (err) {} // eslint-disable-line no-empty
		await this.db.insert({
			_id: id,
			_rev: designDocument && designDocument._rev,
			language: "javascript",
			views: this.views,
		});

		this.designInserted = true;
	}
}

/**
 * Represents a Document, allowing to perform CRUD operations.
 */
class Document {
	/**
	 * @param {Object<string, any>} data
	 * @param {nano.DocumentScope<any>} db
	 */
	constructor(data, db) {
		Object.assign(this, data);

		/** @type {Schema} schema The schema associated with this document */
		this.schema;

		Object.defineProperty(this, "db", {
			enumerable: false,
			value: db,
		});
	}

	/** Saves the document to the database */
	async save() {
		this.dateCreated = this.dateCreated || new Date();
		this.lastUpdated = new Date();
		try {
			const document = await this.db.insert(this.serialise());
			this._id = document.id;
			this._rev = document.rev;
		} catch (error) {
			console.error(error);
			throw new Error("[Recorder] Cannot perform save() operation");
		}
	}

	/** Deletes the document from the database */
	async delete() {
		if (!this._rev) {
			throw new Error("[Recorder] Cannot perform delete() operation. Missing revision property '_rev'");
		}
		try {
			await this.db.destroy(this._id, this._rev);
		} catch (error) {
			console.error(error);
			throw new Error("[Recorder] Cannot perform delete() operation");
		}
	}

	// Move to Object.defineProperty in constructor
	serialise() {
		const serialised = {
			_id: this._id,
			modelType: this.modelName,
			dateCreated: this.dateCreated,
			lastUpdated: this.lastUpdated,
		};
		if (this._rev) {
			serialised._rev = this._rev;
		}

		this.schema.names.forEach((property) => {
			serialised[property] = this[property] || this.schema.defaultValue(property);
		});
		// TODO: handle attachments here
		return serialised;
	}

	toJSON() {
		return this.serialise();
	}
}

function hydrateDocument(model, row) {
	const doc = row["doc"] || row["value"];
	const Model = model.getModel(doc.modelType);
	return new Model(doc);
}

class Model extends Document {
	/**
	 * @param {Object<string, any>} data
	 * @param {nano.DocumentScope<any>} db
	 */
	constructor(data, db) {
		super(data, db);
	}

	static async findAll({ raw = false, ...params } = { raw: false }) {
		try {
			const response = await this.db.view(this.modelName, "all", {
				include_docs: true,
				...params,
			});
			return response.rows.map((row) => (raw ? row : hydrateDocument(this, row)));
		} catch (error) {
			console.error(error);
			throw new Error(`[Recorder] An error occured retrieving documents with '${this.modelName}#findAll()'`);
		}
	}

	static async findById(id, { raw = false, ...params } = { raw: false }) {
		try {
			const document = await this.db.get(id, params);
			return raw ? document : hydrateDocument(this, { value: document });
		} catch (error) {
			console.error(error);
			throw new Error(`[Recorder] An error occured retrieving document '${this.modelName}#findById(${id})'`);
		}
	}

	static async findFirst({ raw = false, ...params } = { raw: false }) {
		try {
			const documents = await this.db.view(this.modelName, "all", {
				include_docs: true,
				...params,
			});
			if (documents.length > 0) {
				return raw ? documents[0] : hydrateDocument(this, { value: documents[0] });
			}
			return null;
		} catch (error) {
			console.error(error);
			throw new Error(`[Recorder] An error occured retrieving document with '${this.modelName}#findFirst()'`);
		}
	}

	static async where(viewName, { raw = false, ...params } = { raw: false }) {
		try {
			const response = await this.db.view(this.modelName, viewName, {
				include_docs: true,
				...params,
			});
			return response.rows.map((row) => (raw ? row : hydrateDocument(this, row)));
		} catch (error) {
			console.error(error);
			throw new Error(`[Recorder] An error occured executing view '${this.modelName}#view(${viewName})'`);
		}
	}
}

function applyVirtualsFromSchema(model, schema) {
	Object.keys(schema.virtuals).forEach((virtual) => {
		const virtualDefinition = schema.virtuals[virtual];
		const propertyDefinition = {
			get: virtualDefinition.get.bind(model),
		};
		if (virtualDefinition.set) {
			propertyDefinition.set = virtualDefinition.set.bind(model);
		}
		Object.defineProperty(model, virtual, propertyDefinition);
	});
}

function applyMethodsFromSchema(model, schema) {
	Object.keys(schema.methods).forEach((method) => {
		if (typeof schema.methods[method] === "function") {
			model.prototype[method] = schema.methods[method];
		}
	});
}

function applyStaticMethodsFromSchema(model, schema) {
	Object.keys(schema.statics).forEach((method) => {
		model[method] = schema.statics[method];
	});
}

/**
 * Entry point of the Recorder API. Call this method and connect it to your CouchDB database.
 * @param {string} url
 * @param {string} database
 * @param {nano.Configuration} options
 * @returns
 */
export default async function Recorder(url = DEFAULT_LOCALHOST_COUCHDB, database, options = {}) {
	let connection = nano({ url, ...options });

	/** @type {Object<string, Model>} */
	let models = {};

	/** @type {nano.DocumentScope}*/
	let db;

	if (database) {
		try {
			await connection.db.get(database);
		} catch (err) {
			console.error(`[Recorder] ${database} does not exist! Creating it.`);
			await connection.db.create(database);
		}
		db = connection.db.use(database);
	}

	return {
		/**
		 * The underlying Nano object
		 * @type {nano.ServerScope}
		 */
		connection,

		/**
		 * Retrieves an existing model
		 * @param {string} modelName
		 * @returns {Model}
		 */
		getModel(modelName) {
			if (!(modelName in models)) {
				throw new Error(`[Recorder] Undefined model "${modelName}"`);
			}
			return models[modelName];
		},

		/**
		 * Defines a schema
		 * @param {SchemaDefinition} schema Defines all the properties of the schema
		 * @returns {Schema}
		 */
		defineSchema(schema) {
			if (!schema) {
				throw new TypeError("[Recorder] Missing schema");
			}
			return new Schema(schema, db);
		},

		/**
		 * Register a model upon recorder based on a schema.
		 * Registering a new model will trigger the creation of design document
		 * in CouchDB.
		 * @param {string} modelName
		 * @param {Schema} modelSchema
		 */
		async registerModel(modelName, modelSchema) {
			const schema = modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema, db);
			await schema.updateDesignDoc(modelName);
			class GeneratedModel extends Model {
				/** @param {Object<string, any>} data */
				constructor(data = {}) {
					super(data, db);
					Object.defineProperties(this, {
						// TODO: find a way to type this
						modelName: {
							enumerable: false,
							writable: false,
							value: modelName,
						},
						// TODO: find a way to type this
						schema: {
							enumerable: false,
							writable: false,
							value: schema,
						},
					});
					applyVirtualsFromSchema(this, schema);
					// TODO: apply hooks
				}
			}

			applyMethodsFromSchema(GeneratedModel, schema);
			applyStaticMethodsFromSchema(GeneratedModel, schema);
			// TODO: apply hooks

			Object.defineProperties(GeneratedModel, {
				// Used inside toString to name our "generic" class
				name: { writable: false, value: `Recorder<${modelName}>` },
				modelName: { enumerable: false, writble: false, value: modelName },
				getModel: { enumerable: false, writble: false, value: (modelName) => models[modelName] },
				// Used in Model static methods
				db: { enumerable: false, writable: false, value: db },
			});

			await schema.updateDesignDoc(modelName);
			models[modelName] = GeneratedModel;

			return GeneratedModel;
		},
	};
}

// ████████╗██╗   ██╗██████╗ ███████╗███████╗
// ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝
//    ██║    ╚████╔╝ ██████╔╝█████╗  ███████╗
//    ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ╚════██║
//    ██║      ██║   ██║     ███████╗███████║
//    ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚══════╝

/**
 * @typedef {StringConstructor|BooleanConstructor|NumberConstructor|ArrayConstructor|ObjectConstructor} SchemaSimpleProperty
 */

/**
 * @typedef {object} SchemaProperty
 * @property {SchemaSimpleProperty} type
 * @property {boolean=} view
 * @property {any=} default
 */

/** @typedef {Object<string,SchemaSimpleProperty | SchemaProperty>} SchemaDefinition */

/**
 * @typedef {} Document
 */
