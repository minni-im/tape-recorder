"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _attachment = require("./attachment");

var _attachment2 = _interopRequireDefault(_attachment);

var Document = (function () {
  function Document(data) {
    _classCallCheck(this, Document);

    _extends(this, data);
    this.serialize = this.serialise; // Alias for the Americans :) !
  }

  _createClass(Document, [{
    key: "save",
    value: function save() {
      var _this = this;

      this.dateCreated = this.dateCreated || new Date();
      this.lastUpdated = new Date();

      this.execHook("beforeSave", this);
      var item = this.serialise();

      return new Promise(function (resolve, reject) {
        _this.db.insert(item, function (error, doc) {
          if (error) {
            return reject({ message: error });
          }

          _this.id = doc._id;
          _this.rev = doc._rev;

          _this.execHook("afterSave", _this);
          return resolve(_this);
        });
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this2 = this;

      this.execHook("beforeRemove", this);
      return new Promise(function (resolve, reject) {
        if (!_this2.rev) {
          return reject({
            message: "Remove failed, 'rev' needs to be supplied"
          });
        }

        _this2.db.destroy(_this2.id, _this2.rev, function (error) {
          if (error) {
            reject({ message: error });
          }

          _this2.execHook("afterRemove", _this2);
          return resolve();
        });
      });
    }
  }, {
    key: "serialise",
    value: function serialise() {
      var _this3 = this;

      var serialised = {};
      serialised.dateCreated = this.dateCreated;
      serialised.lastUpdated = this.lastUpdated;
      serialised.modelType = this.modelName;
      serialised.id = this.id;

      this.schema.names.forEach(function (key) {
        serialised[key] = _this3[key];
      });
      return serialised;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.serialise();
    }
  }]);

  return Document;
})();

exports["default"] = Document;
module.exports = exports["default"];