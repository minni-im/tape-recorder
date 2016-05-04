"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mixin = mixin;
exports.sortObjectByKey = sortObjectByKey;
function mixin(Parent) {
  class Mixed extends Parent {}

  for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    mixins[_key - 1] = arguments[_key];
  }

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