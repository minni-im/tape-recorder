"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    this.views = {};
    this.hooks = {
      "beforeCreate": [],
      "beforeSave": [],
      "afterSave": [],
      "beforeRemove": [],
      "afterRemove": []
    };
  }

  /**
   * Alter the current schema by adding new definition
   */

  _createClass(Schema, [{
    key: "add",
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
     * Add a view to underliying CouchDB desgin doc associated to this schema
     *
     * @param {String} name of the view
     * @param {Object} view definition
     */
  }, {
    key: "view",
    value: function view(viewName, viewDefinition) {
      this.views[viewName] = viewDefinition;
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
  }]);

  return Schema;
})();

exports["default"] = Schema;
module.exports = exports["default"];