/**
 * Document class
 *
 * @param {Object} data to be used as the document properties.
 * @api private
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Document = (function () {
  function Document() {
    var _this = this;

    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Document);

    ["_id", "_rev"].forEach(function (key) {
      if (data[key]) {
        _this[key.substr(1)] = data[key];
        delete data[key];
      }
    });
    this._attachments = {};
    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  _createClass(Document, [{
    key: "save",
    value: function save() {
      var _this2 = this;

      this.dateCreated = this.dateCreated || new Date();
      this.lastUpdated = new Date();

      if (!this.id) {
        //TODO Should emit something maybe to notify this is a new Document
      }

      var item = this.serialise();

      return new Promise(function (resolve, reject) {
        _this2.db.insert(item, function (error, doc) {
          if (error) {
            return reject(error);
          }
          _this2.id = doc.id;
          _this2.rev = doc.rev;

          return resolve(_this2);
        });
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (!_this3.rev) {
          return reject({
            error: "",
            reason: "Remove failed, 'rev' needs to be supplied"
          });
        }

        _this3.db.destroy(_this3.id, _this3.rev, function (error) {
          if (error) {
            reject({ message: error });
          }

          return resolve();
        });
      });
    }
  }, {
    key: "serialise",
    value: function serialise() {
      var _this4 = this;

      var attachements = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var serialised = {};
      serialised.dateCreated = this.dateCreated;
      serialised.lastUpdated = this.lastUpdated;
      serialised.modelType = this.modelName;
      serialised._id = this.id;
      if (this.rev) {
        serialised._rev = this.rev;
      }

      this.schema.names.forEach(function (key) {
        serialised[key] = _this4[key];
        if (_this4[key] === undefined) {
          var defaultValueFn = _this4.schema.getDefaultFunction(key);
          serialised[key] = defaultValueFn();
        }
      });

      // Special attachments usecase.
      if (attachements && this._attachments) {
        serialised._attachments = this._attachments;
      }
      return serialised;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var attachements = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      return this.serialise(attachements);
    }

    /*!
     * Attachments
     * @api public
     */
  }, {
    key: "attachments",
    get: function get() {
      var _this5 = this;

      return {

        /**
         * Save an attachment into the current document
         *
         * @param {String} name attachment's name
         * @param {Blob} data
         * @param {String} contentType attachment's content-type
         * @return {Promise}
         */
        save: function save(name, data, contentType) {
          return new Promise(function (resolve, reject) {
            _this5.db.attachment.insert(_this5.id, name, data, contentType, {
              "rev": _this5.rev
            }, function (error, response) {
              if (error) {
                return reject(error);
              }
              _this5.rev = response.rev;
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
        get: function get(name) {
          var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          _extends(params, { "rev": _this5.rev });
          return new Promise(function (resolve, reject) {
            _this5.db.attachment.get(_this5.id, name, params, function (error, response) {
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
        remove: function remove(name) {
          return new Promise(function (resolve, reject) {
            _this5.db.attachment.destroy(_this5.id, name, {
              "rev": _this5.rev
            }, function (error, response) {
              if (error) {
                return reject(error);
              }
              _this5.rev = response.rev;
              resolve({ "ok": true });
            });
          });
        }
      };
    }
  }]);

  return Document;
})();

exports["default"] = Document;
module.exports = exports["default"];