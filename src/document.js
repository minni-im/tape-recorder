export default class Document {
  constructor(data={}) {
    ["_id", "_rev"].forEach( key => {
      if (data[key]) {
        this[key.substr(1)] = data[key];
        delete data[key];
      }
    });
    this._attachments = {};
    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  save() {
    this.dateCreated = this.dateCreated || new Date();
    this.lastUpdated = new Date();

    if (!this.id) {
      this.execHook("beforeCreate", this);
    }

    this.execHook("beforeSave", this);
    let item = this.serialise();

    return new Promise((resolve, reject) => {
      this.db.insert(item, (error, doc) => {
        if (error) {
          return reject(error);
        }
        this.id = doc.id;
        this.rev = doc.rev;

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
          error: "",
          reason: "Remove failed, 'rev' needs to be supplied"
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
    serialised._id = this.id;
    if (this.rev) {
      serialised._rev = this.rev;
    }

    this.schema.names.forEach(key => {
      serialised[key] = this[key];
      if (this[key] === undefined) {
        let defaultValueFn = this.schema.getDefaultFunction(key);
        serialised[key] = defaultValueFn();
      }
    });

    // Special attachments usecase.
    if (this._attachments) {
      serialised._attachments = this._attachments;
    }
    return serialised;
  }

  toJSON() {
    return this.serialise();
  }

  /*!
   * Attachments
   * @api public
   */
  get attachments() {
    return {

      /**
       * Save an attachment into the current document
       *
       * @param {String} name attachment's name
       * @param {Blob} data
       * @param {String} contentType attachment's content-type
       * @return {Promise}
       */
      save: (name, data, contentType) => {
        return new Promise((resolve, reject) => {
          this.db.attachment.insert(this.id, name, data, contentType, {
            "rev": this.rev
          }, (error, response) => {
            if (error) {
              return reject(error);
            }
            this.rev = response.rev;
            resolve(response);
          });
        });
      },

      /**
       * Retrieve an attachment associated to the current Document.
       *
       * @param {String} name attachment's name
       * @return {Promise}
       */
      get: (name, params={}) => {
        Object.assign(params, { "rev": this.rev });
        return new Promise((resolve, reject) => {
          this.db.attachment.get(this.id, name, params,
            (error, response) => {
              if (error) {
                return reject(error);
              }
              resolve(response);
            });
        });
      },

      /**
       * Remove an existing attachment
       *
       * @param {String} name attachment's name
       * @return {Promise}
       */
      remove: (name) => {
        return new Promise((resolve, reject) => {
          this.db.attachment.destroy(this.id, name, {
            "rev": this.rev
          }, (error, response) => {
            if (error) {
              return reject(error);
            }
            this.rev = response.rev;
            resolve({"ok": true});
          });
        });
      }
    };
  }
}
