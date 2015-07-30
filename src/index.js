import Connection from "./connection";
import Model from "./model";
import Document from "./document";


let urlRegExp = /(.+:)/

/**
 * Recorder class
 */
class Recorder {
  constructor() {
    this.connections = [];
    this.models = {};
    this.modelSchemas = {};

    let conn = this.createConnection(); //create the default connection
  }

  get connection() {
    return this.connections[0];
  }

  set connection(conn) {
    this.connections[0] = conn;
  }

  /**
   * Creates a Connection instance
   *
   * Each `connection` instance maps to a single database. This method is helpful when mangaging multiple db connections.
   *
   * @param {String} [uri] a couchdb http://localhost:5984 uri
   * @param {Object} [options] options to pass to nano
   * @return {Connection} the created Connection object
   * @api public
   */
  createConnection() {
    let conn = new Connection(this);
    this.connections.push(conn);
    if (arguments.length) {
      conn.open.apply(conn, arguments);
    }
    return conn;
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
  connect() {
    let conn = this.connection;
    conn.open.apply(conn, arguments);
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
    let count = this.connections.length;
    let error;

    this.connections.forEach(conn => {
      conn.close(err => {
        if (error) {
          return;
        }

        if (err) {
          error = err;
          if (callback) {
            callback(error);
          }
          throw err;
        }

        if (callback) {
          --count || callback();
        }
      });
    });
    return this;
  }

  /**
   * Define a model or retrieve it
   *
   * Models defined on the `recorder` instance are available to all connection created by the same `recorder` instance.
   *
   * @param {String} name model name
   * @param {Schema} [schema]
   * @param {Object} [views]
   * @return {Model} the model definition
   * @api public
   */
  model(name, schema) {
    if (arguments.length === 1) {
      if (!this.models[name]) {
        throw new Error(`Model '${name}' does not exist.`);
      }
      return this.models[name];
    }
    if (this.models[name]) {
      throw new Error(`Model '${name}' already exists`);
    }
    let model = Model.init(name, schema, this.connection);
    this.models[name] = model;
    return model;
  }

}

export default new Recorder();
