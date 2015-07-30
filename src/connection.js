import nano from "nano";

export default class Connection {
  constructor(base) {
    this.base = base;
    this.db = null;
  }

  /**
   * Open the connection to couchdb
   */
  open(url, database, options, callback) {
    let conn = nano(Object.assign({
      url: url
    }, config));
    conn.db.get(database, error => {
      if (error && error.error === "not_found") {
        conn.db.create(database, createError => {
          if (createError) {
            throw createError;
          }
          this.db = conn.use(database);
          callback(this.db);
        });
      } else {
        this.db = conn.use(database);
        callback(this.db);
      }
    });
  }

  model(name, schema) {
    let model = this.base.model(name, schema);
    this.models[name] = model;

    model.init();
    return model;
  }
}
