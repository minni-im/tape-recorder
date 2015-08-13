
export default class Document {
  constructor(data) {
    Object.assign(this, data);
    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  save(callback = () => {}) {
    this.dateCreated = this.dateCreated || new Date();
    this.lastUpdated = new Date();

    this.execHook("beforeSave", this);

    let item = this.serialise();
    this.db.insert(item, (error, doc) => {
      if (error) {
        console.error(`\nError: ${error.message}`);
        return callback(error, null);
      }

      this.id = doc._id;
      this.rev = doc._rev;

      this.execHook("afterSave", this);
      callback(null, this);
    });
  }

  remove(callback = () => {}) {
    this.execHook("beforeRemove", this);

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

        this.execHook("afterRemove", this);
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

    this.schema.names.forEach(key => {
      serialised[key] = this[key];
    });
    return serialised;
  }

  toJSON() {
    return this.serialise();
  }
}
