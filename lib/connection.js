"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require("events");

var _nano = require("nano");

var _nano2 = _interopRequireDefault(_nano);

var Connection = (function (_EventEmitter) {
  _inherits(Connection, _EventEmitter);

  function Connection(base) {
    _classCallCheck(this, Connection);

    _get(Object.getPrototypeOf(Connection.prototype), "constructor", this).call(this);
    this.base = base;
    //this.db = null;
  }

  /**
   * Open the connection to couchdb
   */

  _createClass(Connection, [{
    key: "open",
    value: function open(url, database, options, callback) {
      var _this = this;

      var nope = function nope() {};
      switch (arguments.length) {
        case 2:
          options = {};
          callback = nope;
          break;
        case 3:
          if (typeof options === "function") {
            callback = options;
            options = {};
          } else {
            callback = nope;
          }
          break;
      }

      var conn = (0, _nano2["default"])(_extends({
        url: url
      }, options));
      conn.db.get(database, function (error) {
        if (error && error.error === "not_found") {
          conn.db.create(database, function (createError) {
            if (createError) {
              throw createError;
            }
            _this.db = conn.use(database);
            _this.emit("connected");
            callback(_this.db);
          });
        } else {
          _this.db = conn.use(database);
          _this.emit("connected");
          callback(_this.db);
        }
      });
    }
  }, {
    key: "close",
    value: function close(callback) {
      this.emit("close");
      callback();
    }
  }, {
    key: "model",
    value: function model(name, schema) {
      var model = this.base.model(name, schema, this.db);
      this.models[name] = model;
      return model;
    }
  }]);

  return Connection;
})(_events.EventEmitter);

exports["default"] = Connection;
module.exports = exports["default"];