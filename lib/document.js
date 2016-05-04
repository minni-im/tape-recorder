"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Document class
 *
 * @param {Object} data to be used as the document properties.
 * @api private
 */
class Document {
  constructor() {
    let data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    ["_id", "_rev"].forEach(key => {
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

    // TODO Should emit something maybe to notify this is a new Document
    // if (!this.id) {
    // }

    const item = this.serialise();

    return new Promise((resolve, reject) => {
      this.db.insert(item, (error, doc) => {
        if (error) {
          return reject(error);
        }
        this.id = doc.id;
        this.rev = doc.rev;

        return resolve(this);
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      if (!this.rev) {
        reject({
          error: "",
          reason: "Remove failed, 'rev' needs to be supplied"
        });
        return;
      }

      this.db.destroy(this.id, this.rev, error => {
        if (error) {
          reject({ message: error });
          return;
        }

        resolve();
      });
    });
  }

  serialise() {
    let attachements = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    const serialised = {};
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
        const defaultValueFn = this.schema.getDefaultFunction(key);
        serialised[key] = defaultValueFn();
      }
    });

    // Special attachments usecase.
    if (attachements && this._attachments) {
      serialised._attachments = this._attachments;
    }
    return serialised;
  }

  toJSON() {
    let attachements = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    return this.serialise(attachements);
  }

  /*!
   * Attachments
   * @api public
   */
  get attachments() {
    var _this = this;

    return {

      /**
       * Save an attachment into the current document
       *
       * @param {String} name attachment's name
       * @param {Blob} data
       * @param {String} contentType attachment's content-type
       * @return {Promise}
       */
      save: (name, data, contentType) => new Promise((resolve, reject) => {
        this.db.attachment.insert(this.id, name, data, contentType, {
          rev: this.rev
        }, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          this.rev = response.rev;
          resolve(response);
        });
      }),

      /**
       * Retrieve an attachment associated to the current Document.
       *
       * @param {String} name attachment's name
       * @return {Promise}
       */
      get: function get(name) {
        let params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        Object.assign(params, { rev: _this.rev });
        return new Promise((resolve, reject) => {
          _this.db.attachment.get(_this.id, name, params, (error, response) => {
            if (error) {
              reject(error);
              return;
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
      remove: name => new Promise((resolve, reject) => {
        this.db.attachment.destroy(this.id, name, {
          rev: this.rev
        }, (error, response) => {
          if (error) {
            reject(error);
            return;
          }
          this.rev = response.rev;
          resolve({ ok: true });
        });
      })
    };
  }
}
exports.default = Document;