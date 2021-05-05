/* eslint-disable max-classes-per-file */
import Document from "./document";
import Schema from "./schema";

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyMethodsFromSchema(model, schema) {
	Object.keys(schema.methods).forEach((method) => {
		if (typeof schema.methods[method] === "function") {
			model.prototype[method] = schema.methods[method];
		}
	});
}

/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyStaticsFromSchema(model, schema) {
	Object.keys(schema.statics).forEach((method) => {
		model[method] = schema.statics[method];
	});
}

/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
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

/*!
 * Register hooks to be associated with this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function attachHooksFromSchema(model, schema) {
	const hooks = schema.hooksQueue.reduce((seed, [hookType, [methodToHook, hook]]) => {
		if (!(methodToHook in seed)) {
			seed[methodToHook] = { pre: [], post: [] };
		}
		seed[methodToHook][hookType].push(hook);
		return seed;
	}, {});
	Object.keys(hooks).forEach((methodName) => {
		const oldMethod = model[methodName];
		const hook = hooks[methodName];
		model.constructor.prototype[methodName] = function () {
			const chain = [...hook.pre, oldMethod, ...hook.post];
			return new Promise((resolve, reject) => {
				let errored = false;
				const final = chain.reduce(
					(onGoing, hookFn) =>
						onGoing
							.then(() => {
								if (errored) {
									// In case of error, we don't want to execute next middlewares
									return false;
								}
								return hookFn.call(model) || true;
							})
							.catch((error) => {
								errored = true;
								reject(error);
							}),
					Promise.resolve(true),
				);
				// Everything went OK, we can resolve;
				final.then(() => {
					resolve();
				});
			});
		};
	});
}

function hydrateDocument(model, row) {
	const doc = row["doc" || "value"];
	const GeneratedModel = model.connection.model(doc.modelType);
	return new GeneratedModel(doc);
}

/**
 * Model class
 *
 * Provide an interface to CouchDB documents as well as creates instances.
 *
 * @param {Object} data values with which to create the document
 * @inherits Document
 * @api public
 */
export default class Model extends Document {
	constructor(data) {
		super(data);
		Object.assign(this, data);
	}

	get db() {
		return this.connection.db;
	}

	/**
	 * Return the entire collection
	 *
	 * @param {Object} params for the underlying view
	 * @return {Promise}
	 * @api public
	 */
	static findAll(params = {}) {
		return this.db
			.view(this.modelName, "all", {
				include_docs: true,
				...params,
			})
			.then(
				(response) => response.rows.map((row) => hydrateDocument(this, row)),
				(error) => console.error(error),
			);
	}

	/**
	 * Finds a single document by its id property
	 *
	 * @param {String} id of the document to retrieve
	 * @param {Object} optional params
	 * @return {Promise}
	 * @api public
	 */
	static findById(id, params = {}) {
		return this.db.get(id, params).then(
			(raw) => hydrateDocument(this, { value: raw }),
			(error) => console.error(error),
		);
	}

	/**
	 * Return the first element of the collection
	 *
	 * @param {Object} optional params
	 * @return {Promise}
	 * @api public
	 */
	static findFirst(params = {}) {
		return this.findAll(params).then((documents) => {
			if (documents.length) {
				return documents[0];
			}
			return null;
		});
	}

	/**
	 * Return the results of a view query for a given viewName.
	 *
	 * @return {Promise}
	 * @api public
	 */
	static where(viewName, params = {}) {
		return this.db
			.view(this.modelName, viewName, {
				include_docs: true,
				...params,
			})
			.then(
				(response) => response.rows.map((row) => hydrateDocument(this, row)),
				(error) => {
					console.error(error);
				},
			);
	}

	/*!
	 * Model init utility
	 *
	 * @param {String} modelName model name
	 * @param {Schema} schema
	 * @param {Connection} connection
	 */
	static init(modelName, modelSchema, connection) {
		const schema = modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema);
		schema.updateDesignDoc(modelName, connection.db);

		// Let's contruct the inner class representing this model
		class GeneratedModel extends Model {
			constructor(data = {}) {
				super(data);
				Object.defineProperties(this, {
					modelName: {
						enumerable: false,
						writable: false,
						value: modelName,
					},
					schema: {
						enumerable: false,
						writable: false,
						value: schema,
					},
					connection: {
						enumerable: false,
						writable: false,
						value: connection,
					},
				});
				applyVirtualsFromSchema(this, schema);
				attachHooksFromSchema(this, schema);
			}
		}

		applyMethodsFromSchema(GeneratedModel, schema);
		applyStaticsFromSchema(GeneratedModel, schema);

		Object.defineProperties(GeneratedModel, {
			// Used by toString()
			name: { writable: false, value: `Recorder<${modelName}>` },
			modelName: { writable: false, value: modelName },
			connection: { writable: false, value: connection },
			db: { writable: false, value: connection.db },
		});
		return GeneratedModel;
	}
}
