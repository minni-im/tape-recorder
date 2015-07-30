export let Saveable = {
  beforeSaveHook() {},
  afterSaveHook() {},
  save() {}
};

export let Removable = {
  beforeRemoveHook() {},
  afterRemoveHook() {},
  remove() {}
};

export let Queryable = {
  find() {},
  findAll() {},
  where() {}
}
