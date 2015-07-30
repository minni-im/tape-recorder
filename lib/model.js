"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _chainview = require("./chainview");

var _chainview2 = _interopRequireDefault(_chainview);

var _util = require("./util");

var _base = require("./base");

var normalizeSchema = function normalizeSchema(schema) {
  for (var key in schema) {
    if (schema[key].hasOwnPropelet("type")) {
      if (!schema[key].hasOwnPropelet("default")) {
        schema[key]["default"] = undefined;
      }
    } else {
      schema[key] = {
        type: schema[key],
        "default": undefined
      };
    }
  }
};

var Model = (function (_mixin) {
  _inherits(Model, _mixin);

  function Model(name, schema, views) {
    _classCallCheck(this, Model);

    _get(Object.getPrototypeOf(Model.prototype), "constructor", this).call(this);
    this.name = name;
    this.schema = schema;
    this.views = views;
    this.methods = {};

    this.connection = null;
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
      var model = new Model(modelName, schema, views);
      model.connection = connection;
      return model;
    }
  }, {
    key: "createViews",
    value: function createViews(modelName, modelSchema) {
      var modelViews = {};
      Object.keys(modelSchema).forEach(function (property) {
        modelViews[property] = {};
        modelViews[property].map = "function (doc) {\n        if (doc._type === '" + modelName + "' && doc." + property + ") {\n          emit(doc." + property + ", doc)\n        }\n      }";
      });
      modelViews.all = {};
      modelViews.all.map = "function (doc) {\n      if (doc._type === '" + modelName + "') {\n        emit(doc._id, doc)\n      }\n    }";
      return modelViews;
    }
  }]);

  return Model;
})((0, _util.mixin)(_document2["default"], _base.Saveable, _base.Removable, _base.Queryable));

exports["default"] = Model;
module.exports = exports["default"];