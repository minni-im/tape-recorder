"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _util = require("./util");

var normalizeSchema = function normalizeSchema(schema) {
  for (var key in schema) {
    if (schema[key].hasOwnProperty("type")) {
      if (!schema[key].hasOwnProperty("default")) {
        schema[key]["default"] = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        "default": undefined
      };
    }
  }
  return schema;
};

var getHookName = function getHookName(type, name) {
  return type + name[0].toUpperCase() + name.substr(1);
};

/**
 * Schema class
 */

var Schema = (function () {
  function Schema(schema) {
    _classCallCheck(this, Schema);

    this.schema = normalizeSchema(schema);
    this.methods = {};
    this.statics = {};
    this.virtuals = {};
    this.views = {};
    this.hooks = {
      "beforeCreate": [],
      "beforeSave": [],
      "afterSave": [],
      "beforeRemove": [],
      "afterRemove": []
    };
    this._designUpdated = false;
  }

  /**
   * Generate the internal views associated to all property
   * @param {String} modelName
   * @api private
   */

  _createClass(Schema, [{
    key: "generateDesignDoc",
    value: function generateDesignDoc(modelName) {
      var _this = this;

      this.view("all", {
        map: "function(doc) {\n        if (doc.modelType === \"" + modelName + "\") {\n          emit(doc._id, doc);\n        }\n      }"
      });
      this.names.forEach(function (property) {
        _this.view(property, {
          map: "function(doc) {\n          if (doc.modelType === \"" + modelName + "\" && doc." + property + ") {\n            emit(doc." + property + ", doc);\n          }\n        }"
        });
      });
    }

    /**
     * @param {String} modelName
     * @param {Connection} nano object
     * @api private
     */
  }, {
    key: "updateDesignDoc",
    value: function updateDesignDoc(modelName, connection) {
      var _this2 = this;

      if (this._designUpdated) {
        return;
      }
      var _designId = "_design/" + modelName;
      var update = function update(rev) {
        connection.insert({
          "_id": _designId,
          "_rev": rev ? rev : undefined,
          "language": "javascript",
          "views": (0, _util.sortObjectByKey)(_this2.views)
        }, function (error) {
          if (error) {
            console.error("Design Update '" + error.error + "' Error: " + error.reason);
          }
          _this2._designUpdated = true;
        });
      };
      connection.get(_designId, function (error, design) {
        update(design && design._rev);
      });
    }

    /**
     * All schema property names
     * @return {Array} property names
     */
  }, {
    key: "add",

    /**
     * Alter the current schema by adding new definition
     */
    value: function add(schema) {
      _extends(this.schema, normalizeSchema(schema));
    }

    /**
     * Adds an instance method to documents constructed from models compiled from this schema.
     *
     * If a hash of methodName/fn pairs is passed as the only argument, each methodName/fn pair will be added as methods.
     *
     * @param {String|Object} method name
     * @param {Function} [fn]
     *
     */
  }, {
    key: "method",
    value: function method(methodName, fn) {
      if (typeof methodName !== "string") {
        for (var method in methodName) {
          this.methods[method] = methodName[method];
        }
      } else {
        this.methods[methodName] = fn;
      }
      return this;
    }

    /**
     * Adds static "class" methods to models compiled from this schema.
     *
     * If a hash of methodName/fn pairs is passed as the only argument, each methodName/fn pair will be added as statics.
     *
     * @param {String|Object} method name
     * @param {Function} fn
     */
  }, {
    key: "static",
    value: function _static(methodName, fn) {
      if (typeof methodName !== "string") {
        for (var method in methodName) {
          this.statics[method] = methodName[method];
        }
      } else {
        this.statics[methodName] = fn;
      }
      return this;
    }

    /**
     * Create a virtual property to the compiled model.
     *
     * If a hash of virtualName/ObjectGetterSetter is passed as the only argument, each pair will be added to the virtuals.
     * @return {Schema} this
     */
  }, {
    key: "virtual",
    value: function virtual(virtualName, getter, setter) {
      if (typeof virtualName !== "string") {
        for (var _name in virtualName) {
          this.virtuals[_name] = {
            get: virtualName[_name].get
          };
          if (virtualName[_name].set) {
            this.virtuals[_name].set = virtualName[_name].set;
          }
        }
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
      var hookName = getHookName("before", name);
      if (this.hooks[hookName]) {
        this.hooks[hookName].push(fn);
      }
      return this;
    }

    /**
     * Define a post hook for the document
     *
     * Post hooks fire `on` the event emitted from document instances of models compiled from this schema.
     *
     * @param {String} name of the event to be hooked to
     * @param {Function} fn callback
     */
  }, {
    key: "post",
    value: function post(name, fn) {
      var hookName = getHookName("after", name);
      if (this.hooks[hookName]) {
        this.hooks[hookName].push(fn);
      }
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
      var defaultValue = this.schema[name]["default"];
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
})();

exports["default"] = Schema;
module.exports = exports["default"];