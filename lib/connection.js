"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _nano = require("nano");

var _nano2 = _interopRequireDefault(_nano);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nope() {}

class Connection extends _events.EventEmitter {
  constructor(base) {
    super();
    this.base = base;
  }

  /**
   * Open the connection to couchdb
   */
  open(url, database, options = {}, callback = nope) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    const conn = (0, _nano2.default)(Object.assign({ url }, options));
    conn.db.get(database, error => {
      if (error && error.error === "not_found") {
        conn.db.create(database, createError => {
          if (createError) {
            throw createError;
          }
          this.db = conn.use(database);
          this.emit("connected", this.db);
          callback(this.db);
        });
      } else {
        this.db = conn.use(database);
        this.emit("connected", this.db);
        callback(this.db);
      }
    });
  }

  close(callback) {
    this.emit("close");
    callback();
  }

  model(name, schema) {
    const model = this.base.model(name, schema);
    this.models[name] = model;
    return model;
  }
}
exports.default = Connection;