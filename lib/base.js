"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var populateMethods = function populateMethods(model, methods) {
  Object.keys(methods).forEach(function (key) {
    model[key] = methods[key];
  });
};

var populateData = function populateData(model, schema, data) {
  Object.keys(schema).forEach(function (key) {
    //TODO: should handle hasOne, hasMany
    if (model[key] !== undefined) {
      model[key] = data[key];
    } else {
      model[key] = schema[key]["default"];
    }
  });
};

var Loadable = {
  beforeCreate: function beforeCreate(fn) {
    this.hooks.beforeCreate = fn;
  },

  load: function load(data) {
    var model = new _document2["default"](this.name, this.schema, this.execHook);
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

exports.Loadable = Loadable;
var Saveable = {
  beforeSave: function beforeSave(fn) {
    this.hooks.beforeSave = fn;
  },
  afterSave: function afterSave(fn) {
    this.hooks.afterSave = fn;
  },
  save: function save() {}
};

exports.Saveable = Saveable;
var Removable = {
  beforeRemove: function beforeRemove(fn) {
    this.hooks.beforeRemove = fn;
  },
  afterRemove: function afterRemove(fn) {
    this.hooks.afterRemove = fn;
  },
  remove: function remove() {}
};

exports.Removable = Removable;
var Queryable = {
  find: function find() {},
  findAll: function findAll() {},
  where: function where() {}
};
exports.Queryable = Queryable;