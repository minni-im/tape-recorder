const normalizeSchema = (schema) => {
  for (let key in schema) {
    if (schema[key].hasOwnProperty("type")) {
      if (!schema[key].hasOwnProperty("default")) {
        schema[key].default = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        default: undefined
      };
    }
  }
  return schema;
};

let getHookName = (type, name) => {
  return type + name[0].toUpperCase() + name.substr(1);
};

/**
 * Schema class
 */
export default class Schema {
  constructor(schema) {
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
   * All schema property names
   * @return {Array} property names
   */
  get names() {
    return Object.keys(this.schema);
  }

  /**
   * Alter the current schema by adding new definition
   */
  add(schema) {
    Object.assign(this.schema, normalizeSchema(schema));
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
  method(methodName, fn) {
    if (typeof methodName !== "string") {
      for (let method in methodName) {
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
  static(methodName, fn) {
    if (typeof methodName !== "string") {
      for (let method in methodName) {
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
  view(viewName, viewDefinition) {
    this.views[viewName] = viewDefinition;
  }

  /**
   * Define a pre hook for the document.
   *
   * @param {String} name of the event to be hooked to
   * @param {Function} fn callback
   */
  pre(name, fn) {
    let hookName = getHookName("before", name);
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
  post(name, fn) {
    let hookName = getHookName("after", name);
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
  plugin(plugin, options) {
    plugin(this, options);
    return this;
  }
}
