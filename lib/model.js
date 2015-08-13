"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _schema = require("./schema");

var _schema2 = _interopRequireDefault(_schema);

var Model = (function (_Document) {
  _inherits(Model, _Document);

  function Model(data) {
    _classCallCheck(this, Model);

    _get(Object.getPrototypeOf(Model.prototype), "constructor", this).call(this);
    _extends(this, data);
  }

  _createClass(Model, [{
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
    key: "all",
    value: function all(callback) {
      this.db.view(this.modelName, "all", function (error, documents) {
        if (error) {
          return callback(error);
        }
        callback(null, documents);
      });
    }
  }, {
    key: "where",
    value: function where(viewName, params, callback) {
      if (params === undefined) params = {};

      this.db.view(this.modelName, viewName, params, function (error, documents) {
        if (error) {
          return callback(error);
        }
        callback(null, documents);
      });
    }
  }, {
    key: "findOne",
    value: function findOne() {}
  }, {
    key: "init",
    value: function init(modelName, modelSchema, connection) {
      var schema = modelSchema instanceof _schema2["default"] ? modelSchema : new _schema2["default"](modelSchema);
      schema.generateDesignDoc(modelName);
      schema.updateDesignDoc(modelName, connection.db);

      return (function (_Model) {
        _inherits(GeneratedModel, _Model);

        function GeneratedModel(data) {
          _classCallCheck(this, GeneratedModel);

          _get(Object.getPrototypeOf(GeneratedModel.prototype), "constructor", this).call(this, data);
          this.modelName = modelName;
          this.schema = schema;
          this.connection = connection;
        }

        return GeneratedModel;
      })(Model);
    }
  }]);

  return Model;
})(_document2["default"]);

exports["default"] = Model;
module.exports = exports["default"];