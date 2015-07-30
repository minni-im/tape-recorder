"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _connection = require("./connection");

var _connection2 = _interopRequireDefault(_connection);

var _model = require("./model");

/**
 * Recorder class
 */

var _model2 = _interopRequireDefault(_model);

var Recorder = (function () {
  function Recorder() {
    _classCallCheck(this, Recorder);

    this.connections = [];
    this.models = {};
    this.modelSchemas = {};

    this.options = {};

    var conn = this.createConnection(); //create the default connection
    conn.models = this.models;
  }

  _createClass(Recorder, [{
    key: "createConnection",

    /**
     * Creates a Connection instance
     * Each `connection` instance maps to a single database. This method is helpful when mangaging multiple db connections.
     */
    value: function createConnection() {
      var conn = new _connection2["default"](this);
      this.connections.push(conn);

      return conn;
    }

    /**
     * Opens the default mongoose connection.
     *
     */
  }, {
    key: "connect",
    value: function connect(options) {
      var conn = this.connection;

      return this;
    }
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
              return callback(error);
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
  }, {
    key: "model",
    value: function model(name, schema) {}
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