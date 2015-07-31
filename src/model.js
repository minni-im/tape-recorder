import ChainableView from "./chainview";
import Document from "./document";

import { mixin } from "./util";

let normalizeSchema = (schema) => {
  for (let key in schema) {
    if (schema[key].hasOwnProperty("type")) {
      if (!schema[key].hasOwnProperty("default")) {
        schema[key].default = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        default: undefined
      };
    }
  }
  return schema;
};

let populateMethods = (model, methods) => {
  Object.keys(methods).forEach(key => {
    model[key] = methods[key];
  });
};

let populateData = (model, schema, data) => {
  Object.keys(schema).forEach(key => {
    //TODO: should handle hasOne, hasMany
    if (data[key] !== undefined) {
      model[key] = data[key];
    } else {
      model[key] = schema[key].default;
    }
  });
};

let Saveable = {
  beforeSave(fn) {
    this.hooks.beforeSave = fn;
  },
  afterSave(fn) {
    this.hooks.afterSave = fn;
  }
};

let Removable = {
  beforeRemove(fn) {
    this.hooks.beforeRemove = fn;
  },
  afterRemove(fn) {
    this.hooks.afterRemove = fn;
  }
};

let Loadable = {
  beforeCreate(fn) {
    this.hooks.beforeCreate = fn;
  },

  load(data) {
    let model = new Document(this);
    populateMethods(model, this.methods);

    if (!data) { return model; }

    populateData(model, this.schema, data);

    if (data._id) { model.id = data._id; }
    if (data._rev) { model.rev = data._rev; }

    model.dateCreated = data.dateCreated;
    model.lastUpdated = data.lastUpdated;

    return model;
  },

  create(data) {
    let model = this.load(data);
    this.execHook("beforeCreate", model);
    return model;
  }
};

let Queryable = {
  find() {},
  findAll() {},
  where() {}
};

export default class Model extends mixin(class Base {}, Loadable, Queryable, Saveable, Removable) {
  constructor(name, schema, views, db) {
    super();
    this.name = name;
    this.schema = schema;
    this.views = views;
    this.methods = {};
    this.hooks = {};
    this.db = db;
  }

  addView(viewName, view) {
    this.views[viewName] = view;
  }

  addMethod(methodName, method) {
    this.methods[methodName] = method;
  }

  execHook(hookName, model) {
    if (this.hooks[hookName]) {
      this.hooks[hookName](model);
    }
  }

  view(viewName, options, callback) {
    if (arguments.length === 1) {
      return new ChainableView(this, viewName);
    }
    super.view(this.name, viewName, options, callback);
  }

  static init(modelName, modelSchema, connection) {
    let schema = normalizeSchema(modelSchema);
    let views = Model.createViews(modelName, schema);
    return new Model(modelName, schema, views, connection);
  }

  static createViews(modelName, modelSchema) {
    let modelViews = {};
    Object.keys(modelSchema).forEach(property => {
      modelViews[property] = {};
      modelViews[property].map = `function (doc) {
        if (doc.modelType === '${modelName}' && doc.${property}) {
          emit(doc.${property}, doc)
        }
      }`;
    });
    modelViews.all = {};
    modelViews.all.map = `function (doc) {
      if (doc.modelType === '${modelName}') {
        emit(doc._id, doc)
      }
    }`;
    return modelViews;
  }
}
