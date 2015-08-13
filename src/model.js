import Document from "./document";
import Schema from "./schema";

export default class Model {
  constructor(data) {
    this.data = data;
  }

  toJSON() {
    return this.data;
  }

  toString() {
    return JSON.stringify(this.data);
  }

  get db() {
    return this.connection.db;
  }

  execHook(hookName, model) {
    console.log(`about to execute hook ${hookName}`);
  }

  static init(modelName, modelSchema, connection) {
    let schema = modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema);

    // Creating all necessary views related to Schema structure
    schema.names.forEach(property => {
      schema.view(property, {
        map: `function (doc) {
          if (doc.modelType === '${modelName}' && doc.${property}) {
            emit(doc.${property}, doc)
          }
        }`
      });
    });

    // Creating an `all` view to return all Documents associated to this Schema
    schema.view("all", {
      map: `function (doc) {
        if (doc.modelType === '${modelName}') {
          emit(doc._id, doc)
        }
      }`
    });

    return (data) => {
      let instance = new Model(data);
      instance.name = modelName;
      instance.schema = schema;
      instance.connection = connection;
      return instance;
    }
  }
}
