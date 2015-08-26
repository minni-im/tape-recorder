"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 */
var applyVirtualsFromSchema = function applyVirtualsFromSchema(model, schema) {
  for (var virtual in schema.virtuals) {
    var virtualDefinition = schema.virtuals[virtual];
    var propertyDefinition = {
      get: virtualDefinition.get.bind(model)
    };
    if (virtualDefinition.set) {
      propertyDefinition.set = virtualDefinition.set.bind(model);
    }
    Object.defineProperty(model, virtual, propertyDefinition);
  }
};

var hydrateDocument = function hydrateDocument(model, row) {
  var GeneratedModel = model.connection.model(row.value.modelType);
  return new GeneratedModel(row.value);
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

    _get(Object.getPrototypeOf(Model.prototype), "constructor", this).call(this, data);
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
        _this.db.view(_this.modelName, "all", function (error, response) {
          if (error) {
            return reject(error);
          }
          var docs = response.rows.map(function (row) {
            return hydrateDocument(_this, row);
          });
          resolve(docs);
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
      return this.findFirst();
    }

    /**
     *
     * @return {Promise}
     * @api public
     */
  }, {
    key: "findFirst",
    value: function findFirst() {
      return this.findAll().then(function (documents) {
        if (documents.length) {
          return documents[0];
        }
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
        _this2.db.view(_this2.modelName, viewName, params, function (error, response) {
          if (error) {
            return reject(error);
          }
          var docs = response.rows.map(function (row) {
            return hydrateDocument(_this2.modelName, _this2.schema, row, _this2.connection);
          });
          resolve(docs);
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

        function GeneratedModel() {
          var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

          _classCallCheck(this, GeneratedModel);

          _get(Object.getPrototypeOf(GeneratedModel.prototype), "constructor", this).call(this, data);
          this.modelName = modelName;
          this.schema = schema;
          this.connection = connection;
          applyVirtualsFromSchema(this, schema);
        }

        return GeneratedModel;
      })(Model);

      applyMethodsFromSchema(GeneratedModel, schema);
      applyStaticsFromSchema(GeneratedModel, schema);

      //TODO should be done differently. Don't like to publish that information statically. Check what could happen with multiple connections.
      GeneratedModel.modelName = modelName;
      GeneratedModel.schema = schema;
      GeneratedModel.connection = connection;
      GeneratedModel.db = connection.db;

      return GeneratedModel;
    }
  }]);

  return Model;
})(_document2["default"]);

exports["default"] = Model;
module.exports = exports["default"];