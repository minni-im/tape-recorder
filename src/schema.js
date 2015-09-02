import { sortObjectByKey } from "./util";

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
  generateDesignDoc(modelName) {
    this.view("all", {
      map: `function(doc) {
        if (doc.modelType === "${modelName}") {
          emit(doc._id, doc);
        }
      }`
    });
    this.names.forEach(property => {
      this.view(property, {
        map: `function(doc) {
          if (doc.modelType === "${modelName}" && doc.${property}) {
            emit(doc.${property}, doc);
          }
        }`
      });
    });
  }

  /**
   * @param {String} modelName
   * @param {Connection} nano object
   * @api private
   */
  updateDesignDoc(modelName, connection) {
    if (this._designUpdated) {
      return;
    }
    let _designId = `_design/${modelName}`;
    let update = (rev) => {
      connection.insert({
        "_id": _designId,
        "_rev": rev ? rev : undefined,
        "language": "javascript",
        "views": sortObjectByKey(this.views)
      }, (error) => {
        if (error) {
          console.error(`Design Update '${error.error}' Error: ${error.reason}`);
        }
        this._designUpdated = true;
      });
    };
    connection.get(_designId, (error, design) => {
      update(design && design._rev);
    });
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
   * Create a virtual property to the compiled model.
   *
   * If a hash of virtualName/ObjectGetterSetter is passed as the only argument, each pair will be added to the virtuals.
   * @return {Schema} this
   */
  virtual(virtualName, getter, setter) {
    if (typeof virtualName !== "string") {
      for (let name in virtualName) {
        this.virtuals[name] = {
          get: virtualName[name].get
        };
        if (virtualName[name].set) {
          this.virtuals[name].set = virtualName[name].set;
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
  view(viewName, viewDefinition) {
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

  /**
   * Get the default value according to the schema definition
   *
   * @param {String} name key name
   * @return {Function} default value function to be executed
   */
  getDefaultFunction(name) {
    let defaultValue = this.schema[name].default;
    if (typeof defaultValue === "function") {
      return defaultValue;
    }
    return () => defaultValue;
  }
}
