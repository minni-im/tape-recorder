"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _schema = require("./schema");

var _schema2 = _interopRequireDefault(_schema);

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyMethodsFromSchema(model, schema) {
  for (var method in schema.methods) {
    if (typeof schema.methods[method] === "function") {
      model.prototype[method] = schema.methods[method];
    }
  }
}

/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyStaticsFromSchema(model, schema) {
  for (var stat in schema.statics) {
    model[stat] = schema.statics[stat];
  }
}

/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyVirtualsFromSchema(model, schema) {
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
}

/*!
 * Register hooks to be associated with this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function attachHooksFromSchema(model, schema) {
  var _arguments2 = arguments;

  var hooks = schema.hooksQueue.reduce(function (seed, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var hookType = _ref2[0];

    var _ref2$1 = _slicedToArray(_ref2[1], 2);

    var methodToHook = _ref2$1[0];
    var hook = _ref2$1[1];

    if (!(methodToHook in seed)) {
      seed[methodToHook] = { pre: [], post: [] };
    }
    seed[methodToHook][hookType] = hook;
  }, {});

  Object.keys(hooks).forEach(function (methodName) {
    var oldMethod = model[methodName];
    var hook = hooks[methodName];
    model.prototype[methodName] = function () {
      var chain = [].concat(_toConsumableArray(hook.pre), [oldMethod.bind(model, _arguments2)], _toConsumableArray(hook.post));
      return new Promise(function (resolve, reject) {
        var errored = false;
        var final = chain.reduce(function (onGoing, hookFn) {
          return onGoing.then(function () {
            if (errored) {
              // In case of error, we don't want to execute next middlewares
              return false;
            }
            return hookFn.call(model);
          })["catch"](function (error) {
            errored = true;
            reject(error);
          });
        }, Promise.resolve(true));
        // Everything went OK, we can resolve;
        final.then(function () {
          resolve();
        });
      });
    };
  });
}

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
    key: "db",
    get: function get() {
      return this.connection.db;
    }

    /**
     * Return the entire collection
     *
     * @param {Object} params for the underlying view
     * @return {Promise}
     * @api public
     */
  }], [{
    key: "findAll",
    value: function findAll() {
      var _this = this;

      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve, reject) {
        _this.db.view(_this.modelName, "all", params, function (error, response) {
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
     * Finds a single document by its id property
     *
     * @param {String} id of the document to retrieve
     * @param {Object} optional params
     * @return {Promise}
     * @api public
     */
  }, {
    key: "findById",
    value: function findById(id) {
      var _this2 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Promise(function (resolve, reject) {
        _this2.db.get(id, params, function (error, response) {
          if (error) {
            return reject(error);
          }
          resolve(hydrateDocument(_this2, { value: response }));
        });
      });
    }

    /**
     * Return the first element of the collection
     *
     * @param {Object} optional params
     * @return {Promise}
     * @api public
     */
  }, {
    key: "findFirst",
    value: function findFirst() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.findAll(params).then(function (documents) {
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
      var _this3 = this;

      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Promise(function (resolve, reject) {
        _this3.db.view(_this3.modelName, viewName, params, function (error, response) {
          if (error) {
            return reject(error);
          }
          var docs = response.rows.map(function (row) {
            return hydrateDocument(_this3, row);
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
          attachHooksFromSchema(this, schema);
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