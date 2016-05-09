"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* eslint no-restricted-syntax: 0 */


var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _schema = require("./schema");

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyMethodsFromSchema(model, schema) {
  for (const method in schema.methods) {
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
  for (const stat in schema.statics) {
    if (schema.statics.hasOwnProperty(stat)) {
      model[stat] = schema.statics[stat];
    }
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
  for (const virtual in schema.virtuals) {
    if (!schema.virtuals.hasOwnProperty(virtual)) {
      continue;
    }
    const virtualDefinition = schema.virtuals[virtual];
    const propertyDefinition = {
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
  const hooks = schema.hooksQueue.reduce((seed, _ref) => {
    var _ref2 = _slicedToArray(_ref, 2);

    let hookType = _ref2[0];

    var _ref2$ = _slicedToArray(_ref2[1], 2);

    let methodToHook = _ref2$[0];
    let hook = _ref2$[1];

    if (!(methodToHook in seed)) {
      seed[methodToHook] = { pre: [], post: [] };
    }
    seed[methodToHook][hookType].push(hook);
    return seed;
  }, {});
  Object.keys(hooks).forEach(methodName => {
    const oldMethod = model[methodName];
    const hook = hooks[methodName];
    model.constructor.prototype[methodName] = function () {
      const chain = [...hook.pre, oldMethod, ...hook.post];
      return new Promise((resolve, reject) => {
        let errored = false;
        const final = chain.reduce((onGoing, hookFn) => onGoing.then(() => {
          if (errored) {
            // In case of error, we don't want to execute next middlewares
            return false;
          }
          return hookFn.call(model) || true;
        }).catch(error => {
          errored = true;
          reject(error);
        }), Promise.resolve(true));
        // Everything went OK, we can resolve;
        final.then(() => {
          resolve();
        });
      });
    };
  });
}

function hydrateDocument(model, row) {
  const GeneratedModel = model.connection.model(row.value.modelType);
  return new GeneratedModel(row.value);
}

/**
 * Model class
 *
 * Provide an interface to CouchDB documents as well as creates instances.
 *
 * @param {Object} data values with which to create the document
 * @inherits Document
 * @api public
 */
class Model extends _document2.default {
  constructor(data) {
    super(data);
    Object.assign(this, data);
  }

  get db() {
    return this.connection.db;
  }

  /**
   * Return the entire collection
   *
   * @param {Object} params for the underlying view
   * @return {Promise}
   * @api public
   */
  static findAll() {
    let params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return new Promise((resolve, reject) => this.db.view(this.modelName, "all", params, (error, response) => {
      if (error) {
        return reject(error);
      }
      const docs = response.rows.map(row => hydrateDocument(this, row));

      return resolve(docs);
    }));
  }

  /**
   * Finds a single document by its id property
   *
   * @param {String} id of the document to retrieve
   * @param {Object} optional params
   * @return {Promise}
   * @api public
   */
  static findById(id) {
    let params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Promise((resolve, reject) => {
      this.db.get(id, params, (error, response) => {
        if (error) {
          return reject(error);
        }
        return resolve(hydrateDocument(this, { value: response }));
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
  static findFirst() {
    let params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return this.findAll(params).then(documents => {
      if (documents.length) {
        return documents[0];
      }
      return null;
    });
  }

  /**
   *
   * @return {Promise}
   * @api public
   */
  static where(viewName) {
    let params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new Promise((resolve, reject) => {
      this.db.view(this.modelName, viewName, params, (error, response) => {
        if (error) {
          return reject(error);
        }
        const docs = response.rows.map(row => hydrateDocument(this, row));
        return resolve(docs);
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
  static init(modelName, modelSchema, connection) {
    const schema = modelSchema instanceof _schema2.default ? modelSchema : new _schema2.default(modelSchema);
    schema.generateDesignDoc(modelName);
    schema.updateDesignDoc(modelName, connection.db);

    // Let's contruct the inner class representing this model
    class GeneratedModel extends Model {
      constructor() {
        let data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        super(data);
        this.modelName = modelName;
        this.schema = schema;
        this.connection = connection;
        applyVirtualsFromSchema(this, schema);
        attachHooksFromSchema(this, schema);
      }
    }

    applyMethodsFromSchema(GeneratedModel, schema);
    applyStaticsFromSchema(GeneratedModel, schema);

    /* TODO should be done differently. Don't like to publish that information
    statically. Check what could happen with multiple connections.
    */
    GeneratedModel.modelName = modelName;
    GeneratedModel.schema = schema;
    GeneratedModel.connection = connection;
    GeneratedModel.db = connection.db;

    return GeneratedModel;
  }
}
exports.default = Model;