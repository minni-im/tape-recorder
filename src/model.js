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

/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */
let applyVirtualsFromSchema = (model, schema) => {
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
};

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
      this.db.view(this.modelName, "all", (error, response) => {
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
   *
   * @return {Promise}
   * @api public
   */
  static findOne() {
    return this.findFirst();
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static findFirst() {
    return this.findAll()
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
          return hydrateDocument(this.modelName, this.schema, row, this.connection);
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
