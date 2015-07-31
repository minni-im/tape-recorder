
export default class Document {
  constructor(model) {
    this.name = model.name;
    this.schema = model.schema;
    this.hookExecutor = (hookName, modelObject) => {
      model.execHook.call(model, hookName, modelObject);
    };
    this.db = model.db;

    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  save(callback = () => {}) {
    this.dateCreated = this.dateCreated || new Date();
    this.lastUpdated = new Date();

    this.hookExecutor("beforeSave", this);

    let item = this.serialise();
    this.db.insert(item, (error, doc) => {
      if (error) {
        console.error(`\nError: ${error.message}`);
        return callback(error, null);
      }

      this.id = doc._id;
      this.rev = doc._rev;

      this.hookExecutor("afterSave", this);
      callback(null, this);
    });
  }

  remove(callback = () => {}) {
    this.hookExecutor("beforeRemove", this);

    try {
      if (!this.rev) {
        return callback({
          message: "Remove failed, 'rev' needs to be supplied"
        });
      }

      this.db.destroy(this.id, this.rev, (error) => {
        if (error) {
          callback(error, null);
        }

        this.hookExecutor("afterRemove", this);
        callback(null);
      });
    } catch(ex) {
      console.error(`\nError: ${ex}`);
      callback(ex);
    }
  }

  serialise() {
    let serialised = {};
    serialised.dateCreated = this.dateCreated;
    serialised.lastUpdated = this.lastUpdated;
    serialised.modelType = this.name;
    serialised.id = this.id;

    Object.keys(this.schema).forEach(key => {
      serialised[key] = this[key];
    });
    return serialised;
  }

  toJSON() {
    return this.serialise();
  }
}
