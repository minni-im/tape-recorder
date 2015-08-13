"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

      this.dateCreated = this.dateCreated || new Date();
      this.lastUpdated = new Date();

      this.execHook("beforeSave", this);

      var item = this.serialise();
      this.db.insert(item, function (error, doc) {
        if (error) {
          console.error("\nError: " + error.message);
          return callback(error, null);
        }

        _this.id = doc._id;
        _this.rev = doc._rev;

        _this.execHook("afterSave", _this);
        callback(null, _this);
      });
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this2 = this;

      var callback = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

      this.execHook("beforeRemove", this);

      try {
        if (!this.rev) {
          return callback({
            message: "Remove failed, 'rev' needs to be supplied"
          });
        }

        this.db.destroy(this.id, this.rev, function (error) {
          if (error) {
            callback(error, null);
          }

          _this2.execHook("afterRemove", _this2);
          callback(null);
        });
      } catch (ex) {
        console.error("\nError: " + ex);
        callback(ex);
      }
    }
  }, {
    key: "serialise",
    value: function serialise() {
      var _this3 = this;

      var serialised = {};
      serialised.dateCreated = this.dateCreated;
      serialised.lastUpdated = this.lastUpdated;
      serialised.modelType = this.name;
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