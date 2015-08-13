import { EventEmitter } from "events";
import nano from "nano";

export default class Connection extends EventEmitter {
  constructor(base) {
    super();
    this.base = base;
  }

  /**
   * Open the connection to couchdb
   */
  open(url, database, options, callback) {
    let nope = function() {};
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

    let conn = nano(Object.assign({
      url: url
    }, options));
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
    let model = this.base.model(name, schema, this.db);
    this.models[name] = model;
    return model;
  }
}
