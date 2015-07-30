import Connection from "./connection";
import Model from "./model";

/**
 * Recorder class
 */
class Recorder {
  constructor() {
    this.connections = [];
    this.models = {};
    this.modelSchemas = {};

    this.options = {

    };

    let conn = this.createConnection(); //create the default connection
    conn.models = this.models;
  }

  get connection() {
    return this.connections[0];
  }

  set connection(conn) {
    this.connections[0] = conn;
  }

  /**
   * Creates a Connection instance
   * Each `connection` instance maps to a single database. This method is helpful when mangaging multiple db connections.
   */
  createConnection() {
    let conn = new Connection(this);
    this.connections.push(conn);

    return conn;
  }

  /**
   * Opens the default mongoose connection.
   *
   */
  connect(options) {
    let conn = this.connection;

    return this;
  }

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
            return callback(error);
          }
          throw err;
        }

        if (callback) {
          --count || callback();
        }
      })
    });
    return this;
  }


  model(name, schema) {

  }
}
