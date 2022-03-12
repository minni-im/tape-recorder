/* eslint no-restricted-syntax: 0 */
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
  for (const method in schema.methods) {
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
  for (const stat in schema.statics) {
    if (schema.statics.hasOwnProperty(stat)) {
      model[stat] = schema.statics[stat];
    }
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
  for (const virtual in schema.virtuals) {
    if (!schema.virtuals.hasOwnProperty(virtual)) {
      continue;
    }
    const virtualDefinition = schema.virtuals[virtual];
    const propertyDefinition = {
      get: virtualDefinition.get.bind(model),
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
  const hooks = schema.hooksQueue.reduce(
    (seed, [hookType, [methodToHook, hook]]) => {
      if (!(methodToHook in seed)) {
        seed[methodToHook] = { pre: [], post: [] };
      }
      seed[methodToHook][hookType].push(hook);
      return seed;
    },
    {}
  );
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
          Promise.resolve(true)
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
  const doc = row.doc || row.value;
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
    return new Promise((resolve, reject) =>
      this.db.view(
        this.modelName,
        "all",
        Object.assign(
          {
            include_docs: true,
          },
          params
        ),
        (error, response) => {
          if (error) {
            return reject(error);
          }
          const docs = response.rows.map((row) => hydrateDocument(this, row));

          return resolve(docs);
        }
      )
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
    return new Promise((resolve, reject) => {
      this.db.get(id, params, (error, response) => {
        if (error) {
          return reject(error);
        }
        return resolve(hydrateDocument(this, { value: response }));
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
    return this.findAll(params).then((documents) => {
      if (documents.length) {
        return documents[0];
      }
      return null;
    });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static where(viewName, params = {}) {
    return new Promise((resolve, reject) => {
      this.db.view(
        this.modelName,
        viewName,
        Object.assign(
          {
            include_docs: true,
          },
          params
        ),
        (error, response) => {
          if (error) {
            return reject(error);
          }
          const docs = response.rows.map((row) => hydrateDocument(this, row));
          return resolve(docs);
        }
      );
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
    const schema =
      modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema);
    schema.generateDesignDoc(modelName);
    schema.updateDesignDoc(modelName, connection.db);

    // Let's contruct the inner class representing this model
    class GeneratedModel extends Model {
      constructor(data = {}) {
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

    /* TODO should be done differently. Don't like to publish that information
    statically. Check what could happen with multiple connections.
    */
    GeneratedModel.modelName = modelName;
    GeneratedModel.schema = schema;
    GeneratedModel.connection = connection;
    GeneratedModel.db = connection.db;

    return GeneratedModel;
  }
}
