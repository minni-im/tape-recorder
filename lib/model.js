"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _schema = require("./schema");

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */

var _schema2 = _interopRequireDefault(_schema);

var applyMethodsFromSchema = function applyMethodsFromSchema(model, schema) {
  for (var method in schema.methods) {
    if (typeof schema.methods[method] === "function") {
      model.prototype[method] = schema.methods[method];
    }
  }
};

/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */
var applyStaticsFromSchema = function applyStaticsFromSchema(model, schema) {
  for (var stat in schema.statics) {
    model[stat] = schema.statics[stat];
  }
};

/**
 * Model class
 *
 * Provide an interface to CouchDB documents as well as creates instances.
 *
 * @param {Object} data values with which to create the document
 * @inherits Document
 * @api public
 */

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

    /**
     *
     * @return {Promise}
     * @api public
     */
  }, {
    key: "db",
    get: function get() {
      return this.connection.db;
    }
  }], [{
    key: "findAll",
    value: function findAll() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.db.view(_this.modelName, "all", function (error, documents) {
          if (error) {
            return reject(error);
          }
          resolve(documents);
        });
      });
    }

    /**
     *
     * @return {Promise}
     * @api public
     */
  }, {
    key: "findOne",
    value: function findOne() {
      return new Promise(function (reslove, reject) {
        resolve({});
      });
    }

    /**
     *
     * @return {Promise}
     * @api public
     */
  }, {
    key: "findFirst",
    value: function findFirst() {
      return new Promise(function (reslove, reject) {
        resolve({});
      });
    }

    /**
     *
     * @return {Promise}
     * @api public
     */
  }, {
    key: "where",
    value: function where(viewName) {
      var _this2 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Promise(function (resolve, reject) {
        _this2.db.view(_this2.modelName, viewName, params, function (error, documents) {
          if (error) {
            return reject(error);
          }
          resolve(documents);
        });
      });
    }

    /*!
     * Model init utility
     *
     * @param {String} modelName model name
     * @param {Schema} schema
     * @param {Connection} connection
     */
  }, {
    key: "init",
    value: function init(modelName, modelSchema, connection) {
      var schema = modelSchema instanceof _schema2["default"] ? modelSchema : new _schema2["default"](modelSchema);
      schema.generateDesignDoc(modelName);
      schema.updateDesignDoc(modelName, connection.db);

      // Let's contruct the inner class representing this model

      var GeneratedModel = (function (_Model) {
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

      applyMethodsFromSchema(GeneratedModel, schema);
      applyStaticsFromSchema(GeneratedModel, schema);

      return GeneratedModel;
    }
  }]);

  return Model;
})(_document2["default"]);

exports["default"] = Model;
module.exports = exports["default"];