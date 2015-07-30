"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Saveable = {
  beforeSaveHook: function beforeSaveHook() {},
  afterSaveHook: function afterSaveHook() {},
  save: function save() {}
};

exports.Saveable = Saveable;
var Removable = {
  beforeRemoveHook: function beforeRemoveHook() {},
  afterRemoveHook: function afterRemoveHook() {},
  remove: function remove() {}
};

exports.Removable = Removable;
var Queryable = {
  find: function find() {},
  findAll: function findAll() {},
  where: function where() {}
};
exports.Queryable = Queryable;