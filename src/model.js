import Document from "./document";
import Schema from "./schema";

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

  static all(callback) {
    this.db.view(this.modelName, "all", function(error, documents) {
      if (error) {
        return callback(error);
      }
      callback(null, documents);
    });
  }

  static where(viewName, params = {}, callback) {
    this.db.view(this.modelName, viewName, params, function(error, documents) {
      if (error) {
        return callback(error);
      }
      callback(null, documents);
    });
  }

  static findOne() {

  }

  static init(modelName, modelSchema, connection) {
    let schema = modelSchema instanceof Schema ? modelSchema : new Schema(modelSchema);
    schema.generateDesignDoc(modelName);
    schema.updateDesignDoc(modelName, connection.db);

    return class GeneratedModel extends Model {
      constructor(data) {
        super(data);
        this.modelName = modelName;
        this.schema = schema;
        this.connection = connection;
      }
    };
  }
}
