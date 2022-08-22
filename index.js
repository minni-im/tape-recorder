import path from "node:path";
import fs from "node:fs";

import debug from "debug";

import * as pkg from "./package.json";

const log = debug("recorder");

const SCHEMA_FOLDER = "recorder";
const DEFAULT_OPTIONS = {
	url: process.env.COUCHDB_URL || "http://localhost:5984",
	verbose: false,
};

function computeUrl(/** @type string */ base, /** @type string */ db) {
	if (/[^/]$/.test(base)) {
		base += "/";
	}
	return new URL(db, base).toString();
}

function scrub(payload) {
	const auth = payload.headers["Authorization"];
	if (auth) {
		payload.headers["Authorization"] = auth.replace(/Basic (.*)$/, "Basic XXXXXXX");
	}
	const cookie = payload.headers.cookie;
	if (cookie) {
		payload.headers.cookie = "XXXXXXX";
	}
	return payload;
}

function hydrateDocument(ModelConstructor, row) {
	const document = row["doc"] || row["value"];
	delete document.modelType;
	return new ModelConstructor(document);
}

/** Base Recorder error */
class RecorderError extends Error {}

/**
 * Schema class describing a Model
 */
class RecorderSchema {
	#config = {
		useTimestamps: true,
	};

	#descriptor = {};

	/**
	 * Normalize all the default values for a given descriptor.
	 * @param {Object} descriptor
	 * @returns
	 */
	static normalize(descriptor) {
		for (const [key, value] of Object.entries(descriptor)) {
			if (typeof value === "object" && value !== null) {
				const { default: defaultValue } = value;
				if (!defaultValue) {
					descriptor[key].default = undefined;
				} else if (typeof defaultValue === "function") {
					descriptor[key].default = defaultValue;
				} else {
					descriptor[key].default = () => defaultValue;
				}
			} else {
				descriptor[key] = {
					type: value,
					default: undefined,
				};
			}
		}
		return descriptor;
	}

	get modelName() {
		return this.#config.name;
	}

	get [Symbol.toStringTag]() {
		return this.#config.name;
	}

	constructor({ fields, statics, methods }, config) {
		Object.assign(this.#config, config);
		this.#descriptor = RecorderSchema.normalize(fields);
	}

	[Symbol.iterator]() {
		return Object.entries(this.#descriptor)[Symbol.iterator]();
	}
}

/**
 * Represent a CouchDB Document
 */
class Document {
	get id() {
		return this._id;
	}

	get rev() {
		return this._rev;
	}

	set id(id) {
		this._id = id;
	}

	set rev(rev) {
		this._rev = rev;
	}

	constructor(data = {}) {
		Object.assign(this, data);
	}

	/**
	 * Save the document to the database
	 * @return {Promise<Document>}
	 * */
	async save() {
		this.dateCreated = this.dateCreated || new Date();
		if (this.id) {
			this.lastUpdated = new Date();
		}
		try {
			const serialised = this.JSON();
			await this.db.insert(serialised);
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Delete the document to the database
	 * */
	async delete() {}

	/**
	 * Update the document with data
	 * @return {Promise<Document>}
	 * */
	async update(data) {
		Object.assign(this, data);
		await this.save();
	}

	/**
	 * Serialize the Document to a JSON representation
	 * @returns {*}
	 */
	JSON() {
		return {
			_id: this.id,
			_rev: this.rev,
			modelType: this.modelName,
			...this,
		};
	}
}

/**
 * Recorder Model that encapsulate a Document
 * @extends Document
 */
class Model extends Document {
	/**
	 * Retrieves a single Document by id
	 * @param {string} id
	 * @return {Promise<Document>}
	 */
	static async findUnique(id, { raw = false, ...params } = {}) {
		try {
			const document = await this.db.retrieve(id, params);
			return raw ? document : hydrateDocument(this, { value: document });
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Retrieves a list Documents matching the criterias
	 * @param {*} criterias
	 * @return {Promise<Document>[]}
	 */
	static async findMany(criterias) {}

	/**
	 * Retrieves the first Document in a list that matches the criterias
	 * @param {*} criterias
	 */
	static async findFirst(criterias) {}

	/**
	 * Create a new Document and save it
	 * @param {*} data
	 * @returns
	 */
	static async create(data) {
		const doc = new this(data);
		await doc.save();
		return doc;
	}

	get db() {
		return this.constructor.db;
	}

	get modelName() {
		return this.constructor.modelName;
	}
}

// Let's load all schemas "synchronously" by using top-level await
const RECORDER_FOLDER_PATH = path.join(process.cwd(), SCHEMA_FOLDER);
const SCHEMAS_NAMES = fs.readdirSync(RECORDER_FOLDER_PATH);
log("Statically loading schemas from filesystem: %o", RECORDER_FOLDER_PATH);
log("Detected %d schemas to be loaded", SCHEMAS_NAMES.length);
const SCHEMAS = await SCHEMAS_NAMES.reduce(async (aMap, name) => {
	const map = await aMap;
	const modelName = path.basename(name, ".js");
	log("Importing %o schema", modelName);
	const { config, fields, statics = {}, methods = {} } = await import(path.join(RECORDER_FOLDER_PATH, name));

	map.set(
		(config && config.name) || modelName,
		new RecorderSchema(
			{ fields, statics, methods },
			{
				name: modelName,
				useTimestamps: true,
				...config,
			},
		),
	);
	return map;
}, Promise.resolve(new Map()));
log("All schemas have been loaded");

export class RecorderClient {
	#id = Math.floor(Math.random() * 65535).toString(16);
	#authorization = false;
	#connection;
	#dbUrl;
	#log = debug(`recorder:client(${this.#id})`);
	#verbose = false;

	get #ready() {
		return this.#connection;
	}

	/**
	 * A Recorder client establishes a connection to the CouchDB server
	 * and gives access to all registered models.
	 */
	constructor(config = {}) {
		this.#log("Creating an instance of RecorderClient %o", this.#id);
		const { db, url, credentials } =
			typeof config === "string"
				? {
						...DEFAULT_OPTIONS,
						db: config,
				  }
				: Object.assign({}, DEFAULT_OPTIONS, config);

		this.#verbose = config.verbose;
		this.#dbUrl = computeUrl(url, db);
		this.#log(`Connection url: %o`, this.#dbUrl);

		if (credentials) {
			this.#log("Credentials provided for authenticated requests");
			if (credentials.username && credentials.password) {
				this.#authorization =
					"Basic " + Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
			} else {
				throw new RecorderError("Credentials config must define both username and a password.");
			}
		}

		this.#init();
	}

	/**
	 * Generate CouchDB uuids.
	 * @param {Number} count number of uuids to generate (default: 1)
	 * @returns
	 */
	uuids(count = 1) {
		return this.#fetch({
			url: computeUrl(computeUrl(this.#dbUrl, ".."), "_uuids"),
			qs: { count },
		}).then(({ uuids }) => (uuids.length === 1 ? uuids[0] : uuids));
	}

	/**
	 * Retrieve a document from its id.
	 * @param {string} id
	 * @returns
	 */
	retrieve(id, params) {
		const query = {
			method: "GET",
			url: computeUrl(this.#dbUrl, id),
			qs: params,
		};
		return this.#fetch(query);
	}

	/**
	 * Insert a document
	 * @param {*} doc
	 * @param {*} params
	 * @returns
	 */
	insert(doc, params = {}) {
		const create = doc._id === undefined;
		const query = {
			method: create ? "POST" : "PUT",
			url: create ? this.#dbUrl : computeUrl(this.#dbUrl, doc._id),
			body: doc,
			qs: params,
		};
		return this.#fetch(query);
	}

	/**
	 * Destroy a document revision
	 * @param {*} id
	 * @param {*} rev
	 * @returns
	 */
	destroy(id, rev) {
		const query = {
			method: "DELETE",
			url: computeUrl(this.#dbUrl, id),
			qs: { rev },
		};
		return this.#fetch(query);
	}

	async #init() {
		await this.#initDatabase();
		this.#createModels();
	}

	async #initDatabase() {
		this.#log("Verifying database existence");
		return (this.#connection = this.#fetch({
			method: "PUT",
			url: this.#dbUrl,
		})
			.then(
				() => this.#log("Database created"),
				() => this.#log("Database already exist, skipping creation"),
			)
			.then(() => "connected"));
	}

	#createModels() {
		const couchWrapper = {
			retrieve: this.retrieve.bind(this),
			insert: this.insert.bind(this),
			destroy: this.destroy.bind(this),
		};

		SCHEMAS.forEach((schema, modelName) => {
			this.#log("Generating %o model class", modelName);
			class RecorderModel extends Model {
				static modelName = modelName;
				static get [Symbol.toStringTag]() {
					return modelName;
				}
			}
			Object.defineProperty(RecorderModel, "db", { value: couchWrapper });
			Object.defineProperty(this, modelName.toLowerCase(), {
				enumerable: true,
				value: RecorderModel,
			});

			queueMicrotask(async () => {
				await this.#persistDesignDoc(schema);
			});
		});
		log("All models have been created for instance %o", this.#id);
	}

	async #persistDesignDoc(schema) {
		const { modelName } = schema;
		const views = new Map();

		// default "all" view, used to query a specific "Model"
		views.set("all", {
			map: `function(doc) { if (doc.modelType === '${modelName}') { emit(doc._id, null); } }`,
		});
		for (const [field, { view, unique }] of schema) {
			if (view || unique) {
				const definitions = {
					map: `function(doc) { if (doc.modelType === '${modelName}' && doc.${field}) { emit(doc.${field}, null); } }`,
				};
				views.set(`by_${field}`, definitions);

				// To verify unicity, we define a built-in `_count` reducer. It is used
				// via a HEAD request and 'counting' the returned documents.
				if (unique) {
					views.set(`by_${field}_unique`, {
						...definitions,
						reduce: "_count",
					});
				}
			}
		}

		// Persisting a `_design` document to the DB
		const id = `_design/${modelName}`;

		let designDocument;
		try {
			designDocument = await this.retrieve(id);
		} catch {} // eslint-disable-line no-empty

		const viewsAsJson = Object.fromEntries(views);
		if (!designDocument || (designDocument && JSON.stringify(designDocument.views) !== JSON.stringify(viewsAsJson))) {
			this.#log("%o needs an update", id);
			await this.insert({
				_id: id,
				_rev: designDocument && designDocument._rev,
				language: "javascript",
				views: viewsAsJson,
			});
			this.#log("%o design updated!", modelName);
		} else {
			this.#log("%o design update skipped (no change detected)", modelName);
		}
	}

	/**
	 * Performs a single call to CouchDB using fetch
	 * @param {*} request
	 * @returns
	 */
	async #fetch(request) {
		await this.#ready;
		const headers = {
			"content-type": "application/json",
			accept: "application/json",
			"user-agent": `${pkg.name}@${pkg.version} (Node.js ${process.version})`,
			"Accept-Encoding": "deflate, gzip",
			...request.headers,
		};
		if (this.#authorization) {
			headers["Authorization"] = this.#authorization;
		}
		const init = {
			method: request.method || "GET",
			headers,
		};
		if (request.body) {
			init.body = JSON.stringify(request.body);
		}
		const url = new URL(request.url);
		for (const [key, value] of Object.entries(request.qs || {})) {
			url.searchParams.set(key, value);
		}
		if (this.#verbose) {
			const scrubbed = {
				url: url.toString(),
				...structuredClone(init),
			};
			this.#log("%o", scrub(scrubbed));
		}
		return fetch(url, init)
			.then((response) => {
				if (!response.ok) {
					const message = response.statusText;
					const error = new RecorderError(message);
					error.statusCode = response.status;
					error.name = "Error";
					error.scope = "couch";
					throw error;
				}
				return response;
			})
			.then((response) => response.json());
	}
}
