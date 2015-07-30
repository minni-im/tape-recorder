"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _nano = require("nano");

var _nano2 = _interopRequireDefault(_nano);

var Connection = (function () {
  function Connection(base) {
    _classCallCheck(this, Connection);

    this.base = base;
    this.db = null;
  }

  /**
   * Open the connection to couchdb
   */

  _createClass(Connection, [{
    key: "open",
    value: function open(url, database, options, callback) {
      var _this = this;

      var conn = (0, _nano2["default"])(Object.assign({
        url: url
      }, config));
      conn.db.get(database, function (error) {
        if (error && error.error === "not_found") {
          conn.db.create(database, function (createError) {
            if (createError) {
              throw createError;
            }
            _this.db = conn.use(database);
            callback(_this.db);
          });
        } else {
          _this.db = conn.use(database);
          callback(_this.db);
        }
      });
    }
  }, {
    key: "model",
    value: function model(name, schema) {
      var model = this.base.model(name, schema);
      this.models[name] = model;

      model.init();
      return model;
    }
  }]);

  return Connection;
})();

exports["default"] = Connection;
module.exports = exports["default"];