import { EventEmitter } from "events";
import nano from "nano";

function nope() {}

export default class Connection extends EventEmitter {
  constructor(base) {
    super();
    this.base = base;
  }

  /**
   * Open the connection to couchdb
   */
  open(url, database, options = {}, callback = nope) {
    const conn = nano(Object.assign({ url }, options));
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
