"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("./util");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var normalizeSchema = function normalizeSchema(schema) {
  Object.keys(schema).forEach(function (key) {
    if (schema[key].type) {
      if (!schema[key].default) {
        schema[key].default = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        default: undefined
      };
    }
  });
  return schema;
};
/**
 * Schema class
 */


var Schema = /*#__PURE__*/function () {
  function Schema(schema) {
    _classCallCheck(this, Schema);

    this.schema = normalizeSchema(schema);
    this.methods = {};
    this.statics = {};
    this.virtuals = {};
    this.views = {};
    this.hooksQueue = [];
    this._designUpdated = false;
  }
  /**
   * @param {String} modelName
   * @param {Connection} nano object
   * @api private
   */


  _createClass(Schema, [{
    key: "updateDesignDoc",
    value: function () {
      var _updateDesignDoc = _asyncToGenerator(function* (modelName, connection) {
        var _this = this;

        if (this._designUpdated) {
          return;
        } // Default "all" view


        this.view("all", {
          map: "function(doc) {\n        if (doc.modelType === \"".concat(modelName, "\") {\n          emit(doc._id, null);\n        }\n      }")
        }); // Default "property/_all" view

        this.names.forEach(function (property) {
          if (_this.schema[property].view === true) {
            _this.view(property, {
              map: "function(doc) {\n            if (doc.modelType === \"".concat(modelName, "\" && doc.").concat(property, ") {\n              emit(doc.").concat(property, ", null);\n            }\n          }")
            });
          }
        });

        var _designId = "_design/".concat(modelName);

        try {
          var _yield$connection$get = yield connection.get(_designId),
              _rev = _yield$connection$get._rev;

          yield connection.insert({
            id: _designId,
            rev: _rev,
            language: "javascript",
            views: (0, _util.sortObjectByKey)(this.views)
          });
          this._designUpdated = true;
        } catch (error) {
          if (error) {
            console.error("Design Update '".concat(error.error, "' Error: ").concat(error.reason));
          }
        }
      });

      function updateDesignDoc(_x, _x2) {
        return _updateDesignDoc.apply(this, arguments);
      }

      return updateDesignDoc;
    }()
    /**
     * All schema property names
     * @return {Array} property names
     */

  }, {
    key: "method",

    /**
     * Adds an instance method to documents constructed from models compiled
     * from this schema.
     *
     * If a hash of methodName/fn pairs is passed as the only argument,
     * each methodName/fn pair will be added as methods.
     *
     * @param {String|Object} method name
     * @param {Function} [fn]
     *
     */
    value: function method(methodName, fn) {
      var _this2 = this;

      if (typeof methodName !== "string") {
        Object.keys(methodName).forEach(function (method) {
          _this2.methods[method] = methodName[method];
        });
      } else {
        this.methods[methodName] = fn;
      }

      return this;
    }
    /**
     * Adds static "class" methods to models compiled from this schema.
     *
     * If a hash of methodName/fn pairs is passed as the only argument,
     * each methodName/fn pair will be added as statics.
     *
     * @param {String|Object} method name
     * @param {Function} fn
     */

  }, {
    key: "static",
    value: function _static(methodName, fn) {
      var _this3 = this;

      if (typeof methodName !== "string") {
        Object.keys(methodName).forEach(function (method) {
          _this3.statics[method] = methodName[method];
        });
      } else {
        this.statics[methodName] = fn;
      }

      return this;
    }
    /**
     * Create a virtual property to the compiled model.
     *
     * If a hash of virtualName/ObjectGetterSetter is passed as the only argument,
     * each pair will be added to the virtuals.
     * @return {Schema} this
     */

  }, {
    key: "virtual",
    value: function virtual(virtualName, getter, setter) {
      var _this4 = this;

      if (typeof virtualName !== "string") {
        Object.keys(virtualName).forEach(function (name) {
          _this4.virtuals[name] = {
            get: virtualName[name].get
          };

          if (virtualName[name].set) {
            _this4.virtuals[name].set = virtualName[name].set;
          }
        });
      } else {
        this.virtuals[virtualName] = {
          get: getter
        };

        if (setter) {
          this.virtuals[virtualName].set = setter;
        }
      }

      return this;
    }
    /**
     * Add a view to underliying CouchDB desgin doc associated to this schema
     *
     * @param {String} name of the view
     * @param {Object} view definition
     */

  }, {
    key: "view",
    value: function view(viewName, viewDefinition) {
      if (viewDefinition.map) {
        viewDefinition.map = viewDefinition.map.toString();
      }

      if (viewDefinition.reduce) {
        viewDefinition.reduce = viewDefinition.reduce.toString();
      }

      this.views[viewName] = viewDefinition;
      return this;
    }
    /**
     * Define a pre hook for the document.
     *
     * @param {String} name of the event to be hooked to
     * @param {Function} fn callback
     */

  }, {
    key: "pre",
    value: function pre(name, fn) {
      this.hooksQueue.push(["pre", [name, fn]]);
      return this;
    }
    /**
     * Define a post hook for the document
     *
     * Post hooks fire `on` the event emitted from document instances of models
     * compiled from this schema.
     *
     * @param {String} name of the event to be hooked to
     * @param {Function} fn callback
     */

  }, {
    key: "post",
    value: function post(name, fn) {
      this.hooksQueue.push(["post", [name, fn]]);
      return this;
    }
    /**
     * Register a plugin for this schema
     * @param {Function} plugin callback
     * @param {Object} [options] to be injected
     */

  }, {
    key: "plugin",
    value: function plugin(_plugin, options) {
      _plugin(this, options);

      return this;
    }
    /**
     * Get the default value according to the schema definition
     *
     * @param {String} name key name
     * @return {Function} default value function to be executed
     */

  }, {
    key: "getDefaultFunction",
    value: function getDefaultFunction(name) {
      var defaultValue = this.schema[name].default;

      if (typeof defaultValue === "function") {
        return defaultValue;
      }

      return function () {
        return defaultValue;
      };
    }
  }, {
    key: "names",
    get: function get() {
      return Object.keys(this.schema);
    }
  }]);

  return Schema;
}();

exports.default = Schema;