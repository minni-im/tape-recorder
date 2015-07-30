"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _connection = require("./connection");

var _connection2 = _interopRequireDefault(_connection);

var _model = require("./model");

var _model2 = _interopRequireDefault(_model);

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var urlRegExp = /(.+:)/;

/**
 * Recorder class
 */

var Recorder = (function () {
  function Recorder() {
    _classCallCheck(this, Recorder);

    this.connections = [];
    this.models = {};
    this.modelSchemas = {};

    var conn = this.createConnection(); //create the default connection
  }

  _createClass(Recorder, [{
    key: "createConnection",

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
    value: function createConnection() {
      var conn = new _connection2["default"](this);
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
  }, {
    key: "connect",
    value: function connect() {
      var conn = this.connection;
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
  }, {
    key: "disconnect",
    value: function disconnect(callback) {
      var count = this.connections.length;
      var error = undefined;

      this.connections.forEach(function (conn) {
        conn.close(function (err) {
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
  }, {
    key: "model",
    value: function model(name, schema) {
      if (arguments.length === 1) {
        if (!this.models[name]) {
          throw new Error("Model '" + name + "' does not exist.");
        }
        return this.models[name];
      }
      if (this.models[name]) {
        throw new Error("Model '" + name + "' already exists");
      }
      var model = _model2["default"].init(name, schema, this.connection);
      this.models[name] = model;
      return model;
    }
  }, {
    key: "connection",
    get: function get() {
      return this.connections[0];
    },
    set: function set(conn) {
      this.connections[0] = conn;
    }
  }]);

  return Recorder;
})();

exports["default"] = new Recorder();
module.exports = exports["default"];