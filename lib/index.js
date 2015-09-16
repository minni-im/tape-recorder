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

var _schema = require("./schema");

/**
 * Recorder class
 */

var _schema2 = _interopRequireDefault(_schema);

var Recorder = (function () {
  function Recorder() {
    _classCallCheck(this, Recorder);

    this.models = {};
    this.plugins = [];

    var conn = new _connection2["default"](this);
    conn.models = this.models;
    conn.once("connected", function (db) {
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

  _createClass(Recorder, [{
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
      this.connection.close(function (err) {
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
  }, {
    key: "plugin",
    value: function plugin(fn, options) {
      this.plugins.push([fn, options]);
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
      if (arguments.length === 0) {
        throw new Error("Naming your model is mandatory.");
      }
      if (arguments.length === 1 || schema === undefined) {
        if (!this.models[name]) {
          throw new Error("Model '" + name + "' does not exist.");
        }
        return this.models[name];
      }
      if (this.models[name]) {
        throw new Error("Model '" + name + "' already exists. It can't be defined twice.");
      }
      var model = _model2["default"].init(name, schema, this.connection);
      this.models[name] = model;
      return model;
    }
  }]);

  return Recorder;
})();

Recorder.prototype.Schema = _schema2["default"];
exports["default"] = new Recorder();
module.exports = exports["default"];