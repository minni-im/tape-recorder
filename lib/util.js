"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortObjectByKey = sortObjectByKey;

function sortObjectByKey(object) {
  return Object.keys(object).sort().reduce(function (sorted, key) {
    sorted[key] = object[key];
    return sorted;
  }, {});
}