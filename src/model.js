import Document from "./document";
import Schema from "./schema";

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */
let applyMethodsFromSchema = (model, schema) => {
  for (let method in schema.methods) {
    if (typeof schema.methods[method] === "function") {
      model.prototype[method] = schema.methods[method];
    }
  }
};

/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */
let applyStaticsFromSchema = (model, schema) => {
  for (let stat in schema.statics) {
    model[stat] = schema.statics[stat];
  }
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
    super();
    Object.assign(this, data);
  }

  get db() {
    return this.connection.db;
  }

  execHook(hookName, model) {
    console.log(`about to execute hook ${hookName}`);
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static findAll() {
    return new Promise((resolve, reject) => {
      this.db.view(this.modelName, "all", function(error, documents) {
        if (error) {
          return reject(error);
        }
        resolve(documents);
      });
    });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static findOne() {
    return new Promise((reslove, reject) => {
      resolve({});
    });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static findFirst() {
    return new Promise((reslove, reject) => {
      resolve({});
    });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static where(viewName, params = {}) {
    return new Promise((resolve, reject) => {
      this.db.view(this.modelName, viewName, params, function(error, documents) {
        if (error) {
          return reject(error);
        }
        resolve(documents);
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
      constructor(data) {
        super(data);
        this.modelName = modelName;
        this.schema = schema;
        this.connection = connection;
      }
    }

    applyMethodsFromSchema(GeneratedModel, schema);
    applyStaticsFromSchema(GeneratedModel, schema);

    return GeneratedModel;
  }
}
