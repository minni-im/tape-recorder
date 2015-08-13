"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _schema = require("./schema");

var _schema2 = _interopRequireDefault(_schema);

var Model = (function () {
  function Model(data) {
    _classCallCheck(this, Model);

    this.data = data;
  }

  _createClass(Model, [{
    key: "toJSON",
    value: function toJSON() {
      return this.data;
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.data);
    }
  }, {
    key: "execHook",
    value: function execHook(hookName, model) {
      console.log("about to execute hook " + hookName);
    }
  }, {
    key: "db",
    get: function get() {
      return this.connection.db;
    }
  }], [{
    key: "init",
    value: function init(modelName, modelSchema, connection) {
      var schema = modelSchema instanceof _schema2["default"] ? modelSchema : new _schema2["default"](modelSchema);

      // Creating all necessary views related to Schema structure
      schema.names.forEach(function (property) {
        schema.view(property, {
          map: "function (doc) {\n          if (doc.modelType === '" + modelName + "' && doc." + property + ") {\n            emit(doc." + property + ", doc)\n          }\n        }"
        });
      });

      // Creating an `all` view to return all Documents associated to this Schema
      schema.view("all", {
        map: "function (doc) {\n        if (doc.modelType === '" + modelName + "') {\n          emit(doc._id, doc)\n        }\n      }"
      });

      return function (data) {
        var instance = new Model(data);
        instance.name = modelName;
        instance.schema = schema;
        instance.connection = connection;
        return instance;
      };
    }
  }]);

  return Model;
})();

exports["default"] = Model;
module.exports = exports["default"];