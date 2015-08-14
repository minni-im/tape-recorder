import Attachment from "./attachment";

export default class Document {
  constructor(data) {
    Object.assign(this, data);
    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  save() {
    this.dateCreated = this.dateCreated || new Date();
    this.lastUpdated = new Date();

    this.execHook("beforeSave", this);
    let item = this.serialise();

    return new Promise((resolve, reject) => {
      this.db.insert(item, (error, doc) => {
        if (error) {
          return reject({ message: error });
        }

        this.id = doc._id;
        this.rev = doc._rev;

        this.execHook("afterSave", this);
        return resolve(this);
      });
    });
  }

  remove() {
    this.execHook("beforeRemove", this);
    return new Promise((resolve, reject) => {
      if (!this.rev) {
        return reject({
          message: "Remove failed, 'rev' needs to be supplied"
        });
      }

      this.db.destroy(this.id, this.rev, (error) => {
        if (error) {
          reject({ message: error });
        }

        this.execHook("afterRemove", this);
        return resolve();
      });
    });
  }

  serialise() {
    let serialised = {};
    serialised.dateCreated = this.dateCreated;
    serialised.lastUpdated = this.lastUpdated;
    serialised.modelType = this.modelName;
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
