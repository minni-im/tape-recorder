import Connection from "./connection";
import Model from "./model";
import Schema from "./schema";

/**
 * Recorder class
 */
class Recorder {
  constructor() {
    this.models = {};
    this.plugins = [];

    const conn = new Connection(this);
    conn.models = this.models;
    conn.once("connected", (db) => {
      conn.db = db;
    });
    this.connection = conn;
  }

  /**
   * Opens the default mongoose connection.
   *
   * _Options passed take precedence over options included in connection strings._
   *
   * @param {String} uri(s)
   * @param {Object} [options]
   * @param {Function} [callback]
   * @return {Recorder} this
   * @api public
   */
  connect(...options) {
    const conn = this.connection;
    conn.open(...options);
    return this;
  }

  /**
   * Disconnects all connections.
   *
   * @param {Function} [fn] called after all connection close.
   * @return {Recorder} this
   * @api public
   */
  disconnect(callback) {
    this.connection.close(err => {
      if (err) {
        callback(err);
        throw err;
      }
      callback();
    });
    return this;
  }


  /**
   * Declares a global plugin executed on all Schemas.
   *
   * Equivalent to calling `.plugin(fn)` on each Schema you create.
   *
   * @param {Function} fn plugin callback
   * @param {Object} [opts] optional options
   * @return {Recorder} this
   *
   */
  plugin(fn, options) {
    this.plugins.push([fn, options]);
    return this;
  }

  /**
   * Define a model or retrieve it
   *
   * Models defined on the `recorder` instance are available to all connection
   * created by the same `recorder` instance.
   *
   * @param {String} name model name
   * @param {Schema} [schema]
   * @param {Object} [views]
   * @return {Model} the model definition
   * @api public
   */
  model(name, schema) {
    /* eslint prefer-rest-params: 0 */
    if (arguments.length === 0) {
      throw new Error("Naming your model is mandatory.");
    }
    if (arguments.length === 1 || schema === undefined) {
      if (!this.models[name]) {
        throw new Error(`Model '${name}' does not exist.`);
      }
      return this.models[name];
    }
    if (this.models[name]) {
      throw new Error(`Model '${name}' already exists. It can't be defined twice.`);
    }
    const model = Model.init(name, schema, this.connection);
    this.models[name] = model;
    return model;
  }
}

Recorder.prototype.Schema = Schema;
export default new Recorder();
