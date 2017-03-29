"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;
exports.sortObjectByKey = sortObjectByKey;
function mixin(Parent, ...mixins) {
  class Mixed extends Parent {}
  for (const m of mixins) {
    for (const prop of Object.keys(m)) {
      Mixed.prototype[prop] = mixin[prop];
    }
  }
  return Mixed;
}

function sortObjectByKey(object) {
  return Object.keys(object).sort().reduce((sorted, key) => {
    sorted[key] = object[key];
    return sorted;
  }, {});
}