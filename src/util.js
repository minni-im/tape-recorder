export let mixin = (Parent, ...mixins) => {
  class Mixed extends Parent { }
  for (let mixin of mixins) {
    for (let prop of Object.keys(mixin)) {
      Mixed.prototype[prop] = mixin[prop];
    }
  }
  return Mixed;
};

export let sortObjectByKey = (object) => {
  return Object.keys(object).sort().reduce((sorted, key) => {
    sorted[key] = object[key];
    return sorted;
  }, {});
};
