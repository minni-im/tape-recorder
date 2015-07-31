"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _chainview = require("./chainview");

var _chainview2 = _interopRequireDefault(_chainview);

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _util = require("./util");

var normalizeSchema = function normalizeSchema(schema) {
  for (var key in schema) {
    if (schema[key].hasOwnProperty("type")) {
      if (!schema[key].hasOwnProperty("default")) {
        schema[key]["default"] = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        "default": undefined
      };
    }
  }
  return schema;
};

var populateMethods = function populateMethods(model, methods) {
  Object.keys(methods).forEach(function (key) {
    model[key] = methods[key];
  });
};

var populateData = function populateData(model, schema, data) {
  Object.keys(schema).forEach(function (key) {
    //TODO: should handle hasOne, hasMany
    if (data[key] !== undefined) {
      model[key] = data[key];
    } else {
      model[key] = schema[key]["default"];
    }
  });
};

var Saveable = {
  beforeSave: function beforeSave(fn) {
    this.hooks.beforeSave = fn;
  },
  afterSave: function afterSave(fn) {
    this.hooks.afterSave = fn;
  }
};

var Removable = {
  beforeRemove: function beforeRemove(fn) {
    this.hooks.beforeRemove = fn;
  },
  afterRemove: function afterRemove(fn) {
    this.hooks.afterRemove = fn;
  }
};

var Loadable = {
  beforeCreate: function beforeCreate(fn) {
    this.hooks.beforeCreate = fn;
  },

  load: function load(data) {
    var model = new _document2["default"](this);
    populateMethods(model, this.methods);

    if (!data) {
      return model;
    }

    populateData(model, this.schema, data);

    if (data._id) {
      model.id = data._id;
    }
    if (data._rev) {
      model.rev = data._rev;
    }

    model.dateCreated = data.dateCreated;
    model.lastUpdated = data.lastUpdated;

    return model;
  },

  create: function create(data) {
    var model = this.load(data);
    this.execHook("beforeCreate", model);
    return model;
  }
};

var Queryable = {
  find: function find() {},
  findAll: function findAll() {},
  where: function where() {}
};

var Model = (function (_mixin) {
  _inherits(Model, _mixin);

  function Model(name, schema, views, db) {
    _classCallCheck(this, Model);

    _get(Object.getPrototypeOf(Model.prototype), "constructor", this).call(this);
    this.name = name;
    this.schema = schema;
    this.views = views;
    this.methods = {};
    this.hooks = {};
    this.db = db;
  }

  _createClass(Model, [{
    key: "addView",
    value: function addView(viewName, view) {
      this.views[viewName] = view;
    }
  }, {
    key: "addMethod",
    value: function addMethod(methodName, method) {
      this.methods[methodName] = method;
    }
  }, {
    key: "execHook",
    value: function execHook(hookName, model) {
      if (this.hooks[hookName]) {
        this.hooks[hookName](model);
      }
    }
  }, {
    key: "view",
    value: function view(viewName, options, callback) {
      if (arguments.length === 1) {
        return new _chainview2["default"](this, viewName);
      }
      _get(Object.getPrototypeOf(Model.prototype), "view", this).call(this, this.name, viewName, options, callback);
    }
  }], [{
    key: "init",
    value: function init(modelName, modelSchema, connection) {
      var schema = normalizeSchema(modelSchema);
      var views = Model.createViews(modelName, schema);
      return new Model(modelName, schema, views, connection);
    }
  }, {
    key: "createViews",
    value: function createViews(modelName, modelSchema) {
      var modelViews = {};
      Object.keys(modelSchema).forEach(function (property) {
        modelViews[property] = {};
        modelViews[property].map = "function (doc) {\n        if (doc.modelType === '" + modelName + "' && doc." + property + ") {\n          emit(doc." + property + ", doc)\n        }\n      }";
      });
      modelViews.all = {};
      modelViews.all.map = "function (doc) {\n      if (doc.modelType === '" + modelName + "') {\n        emit(doc._id, doc)\n      }\n    }";
      return modelViews;
    }
  }]);

  return Model;
})((0, _util.mixin)(function Base() {
  _classCallCheck(this, Base);
}, Loadable, Queryable, Saveable, Removable));

exports["default"] = Model;
module.exports = exports["default"];