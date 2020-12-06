"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _connection = _interopRequireDefault(require("./connection"));

var _model = _interopRequireDefault(require("./model"));

var _schema = _interopRequireDefault(require("./schema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Recorder class
 */
var Recorder = /*#__PURE__*/function () {
  function Recorder() {
    _classCallCheck(this, Recorder);

    this.models = {};
    this.plugins = [];
    var conn = new _connection.default(this);
    conn.models = this.models;
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
    value: function () {
      var _connect = _asyncToGenerator(function* () {
        var conn = this.connection;
        yield conn.open.apply(conn, arguments);
        return this;
      });

      function connect() {
        return _connect.apply(this, arguments);
      }

      return connect;
    }()
    /**
     * Disconnects all connections.
     *
     * @return {Recorder} this
     * @api public
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      this.connection.close();
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
     * Models defined on the `recorder` instance are available to all connection
     * created by the same `recorder` instance.
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
      /* eslint prefer-rest-params: 0 */
      if (arguments.length === 0) {
        throw new Error("Naming your model is mandatory.");
      }

      if (arguments.length === 1 || schema === undefined) {
        if (!this.models[name]) {
          throw new Error("Model '".concat(name, "' does not exist."));
        }

        return this.models[name];
      }

      if (this.models[name]) {
        throw new Error("Model '".concat(name, "' already exists. It can't be defined twice."));
      }

      var model = _model.default.init(name, schema, this.connection);

      this.models[name] = model;
      return model;
    }
  }]);

  return Recorder;
}();

Recorder.prototype.Schema = _schema.default;

var _default = new Recorder();

exports.default = _default;