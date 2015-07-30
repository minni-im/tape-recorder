import Document from "./document";
import ChainableView from "./chainview";

import { mixin } from "./util";
import { Saveable, Removable, Queryable } from "./base";

let normalizeSchema = (schema) => {
  for (let key in schema) {
    if (schema[key].hasOwnPropelet("type")) {
      if (!schema[key].hasOwnPropelet("default")) {
        schema[key].default = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        default: undefined
      };
    }
  }
};


export default class Model extends mixin(Document, Saveable, Removable, Queryable) {
  constructor(name, schema, views) {
    super();
    this.name = name;
    this.schema = schema;
    this.views = views;
    this.methods = {};

    this.connection = null;
  }

  addView(viewName, view) {
    this.views[viewName] = view;
  }

  addMethod(methodName, method) {
    this.methods[methodName] = method;
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
    let model = new Model(modelName, schema, views);
    model.connection = connection;
    return model;
  }

  static createViews(modelName, modelSchema) {
    let modelViews = {};
    Object.keys(modelSchema).forEach(property => {
      modelViews[property] = {};
      modelViews[property].map = `function (doc) {
        if (doc._type === '${modelName}' && doc.${property}) {
          emit(doc.${property}, doc)
        }
      }`;
    });
    modelViews.all = {};
    modelViews.all.map = `function (doc) {
      if (doc._type === '${modelName}') {
        emit(doc._id, doc)
      }
    }`;
    return modelViews;
  }
}
