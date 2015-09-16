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
  for (let method in schema.methods) {
    if (typeof schema.methods[method] === "function") {
      model.prototype[method] = schema.methods[method];
    }
  }
}

/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyStaticsFromSchema(model, schema) {
  for (let stat in schema.statics) {
    model[stat] = schema.statics[stat];
  }
}

/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyVirtualsFromSchema(model, schema) {
  for (let virtual in schema.virtuals) {
    let virtualDefinition = schema.virtuals[virtual];
    let propertyDefinition = {
      get: virtualDefinition.get.bind(model)
    };
    if (virtualDefinition.set) {
      propertyDefinition.set = virtualDefinition.set.bind(model);
    }
    Object.defineProperty(model, virtual, propertyDefinition);
  }
}

/*!
 * Register hooks to be associated with this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function attachHooksFromSchema(model, schema) {
  let hooks = schema.hooksQueue.reduce((seed, [hookType, [methodToHook, hook]]) => {
    if (!(methodToHook in seed)) {
      seed[methodToHook] = { pre: [], post: [] };
    }
    seed[methodToHook][hookType].push(hook);
    return seed;
  }, {});
  Object.keys(hooks).forEach((methodName) => {
    let oldMethod = model[methodName];
    let hook = hooks[methodName];
    model.constructor.prototype[methodName] = function() {
      let chain = [...hook.pre, oldMethod, ...hook.post];
      return new Promise((resolve, reject) => {
        let errored = false;
        let final = chain.reduce((onGoing, hookFn) => {
          return onGoing
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
            });
        }, Promise.resolve(true));
        // Everything went OK, we can resolve;
        final.then(() => {
          resolve();
        });
      });
    };
  });
}

let hydrateDocument = (model, row) => {
  let GeneratedModel = model.connection.model(row.value.modelType);
  return new GeneratedModel(row.value);
};

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
    return new Promise((resolve, reject) => {
      this.db.view(this.modelName, "all", params, (error, response) => {
        if (error) {
          return reject(error);
        }
        let docs = response.rows.map((row) => {
          return hydrateDocument(this, row);
        });
        resolve(docs);
      });
    });
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
    return new Promise((resolve, reject) => {
      this.db.get(id, params, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(hydrateDocument(this, { value: response }));
      });
    });
  }

  /**
   * Return the first element of the collection
   *
   * @param {Object} optional params
   * @return {Promise}
   * @api public
   */
  static findFirst(params = {}) {
    return this.findAll(params)
      .then(documents => {
        if (documents.length) {
          return documents[0];
        }
      });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static where(viewName, params = {}) {
    return new Promise((resolve, reject) => {
      this.db.view(this.modelName, viewName, params, (error, response) => {
        if (error) {
          return reject(error);
        }
        let docs = response.rows.map((row) => {
          return hydrateDocument(this, row);
        });
        resolve(docs);
      });
    });
  }

  /*!
   * Model init utility
   *
   * @param {String} modelName model name
   * @param {Schema} schema
   * @param {Connection} connection
   */
  static init(modelName, modelSchema, connection) {
    let schema = modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema);
    schema.generateDesignDoc(modelName);
    schema.updateDesignDoc(modelName, connection.db);

    // Let's contruct the inner class representing this model
    class GeneratedModel extends Model {
      constructor(data={}) {
        super(data);
        this.modelName = modelName;
        this.schema = schema;
        this.connection = connection;
        applyVirtualsFromSchema(this, schema);
        attachHooksFromSchema(this, schema);
      }
    }

    applyMethodsFromSchema(GeneratedModel, schema);
    applyStaticsFromSchema(GeneratedModel, schema);

    //TODO should be done differently. Don't like to publish that information statically. Check what could happen with multiple connections.
    GeneratedModel.modelName = modelName;
    GeneratedModel.schema = schema;
    GeneratedModel.connection = connection;
    GeneratedModel.db = connection.db;

    return GeneratedModel;
  }
}
