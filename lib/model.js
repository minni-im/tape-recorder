"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _document = _interopRequireDefault(require("./document"));

var _schema = _interopRequireDefault(require("./schema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/*!
 * Register methods to be applied to this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */
function applyMethodsFromSchema(model, schema) {
  Object.keys(schema.methods).forEach(function (method) {
    if (typeof schema.methods[method] === "function") {
      model.prototype[method] = schema.methods[method];
    }
  });
}
/*!
 * Register statics for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */


function applyStaticsFromSchema(model, schema) {
  Object.keys(schema.statics).forEach(function (method) {
    model[method] = schema.statics[method];
  });
}
/*!
 * Register virtuals properties for this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */


function applyVirtualsFromSchema(model, schema) {
  Object.keys(schema.virtuals).forEach(function (virtual) {
    var virtualDefinition = schema.virtuals[virtual];
    var propertyDefinition = {
      get: virtualDefinition.get.bind(model)
    };

    if (virtualDefinition.set) {
      propertyDefinition.set = virtualDefinition.set.bind(model);
    }

    Object.defineProperty(model, virtual, propertyDefinition);
  });
}
/*!
 * Register hooks to be associated with this model
 *
 * @param {Model} model
 * @param {Schema} schema
 * @api private
 */


function attachHooksFromSchema(model, schema) {
  var hooks = schema.hooksQueue.reduce(function (seed, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        hookType = _ref2[0],
        _ref2$ = _slicedToArray(_ref2[1], 2),
        methodToHook = _ref2$[0],
        hook = _ref2$[1];

    if (!(methodToHook in seed)) {
      seed[methodToHook] = {
        pre: [],
        post: []
      };
    }

    seed[methodToHook][hookType].push(hook);
    return seed;
  }, {});
  Object.keys(hooks).forEach(function (methodName) {
    var oldMethod = model[methodName];
    var hook = hooks[methodName];

    model.constructor.prototype[methodName] = function () {
      var chain = [].concat(_toConsumableArray(hook.pre), [oldMethod], _toConsumableArray(hook.post));
      return new Promise(function (resolve, reject) {
        var errored = false;
        var final = chain.reduce(function (onGoing, hookFn) {
          return onGoing.then(function () {
            if (errored) {
              // In case of error, we don't want to execute next middlewares
              return false;
            }

            return hookFn.call(model) || true;
          }).catch(function (error) {
            errored = true;
            reject(error);
          });
        }, Promise.resolve(true)); // Everything went OK, we can resolve;

        final.then(function () {
          resolve();
        });
      });
    };
  });
}

function hydrateDocument(model, row) {
  var doc = row["doc" || "value"];
  var GeneratedModel = model.connection.model(doc.modelType);
  return new GeneratedModel(doc);
}
/**
 * Model class
 *
 * Provide an interface to CouchDB documents as well as creates instances.
 *
 * @param {Object} data values with which to create the document
 * @inherits Document
 * @api public
 */


var Model = /*#__PURE__*/function (_Document) {
  _inherits(Model, _Document);

  var _super = _createSuper(Model);

  function Model(data) {
    var _this;

    _classCallCheck(this, Model);

    _this = _super.call(this, data);
    Object.assign(_assertThisInitialized(_this), data);
    return _this;
  }

  _createClass(Model, [{
    key: "db",
    get: function get() {
      return this.connection.db;
    }
    /**
     * Return the entire collection
     *
     * @param {Object} params for the underlying view
     * @return {Promise}
     * @api public
     */

  }], [{
    key: "findAll",
    value: function findAll() {
      var _this2 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.db.view(this.modelName, "all", _objectSpread({
        include_docs: true
      }, params)).then(function (response) {
        return response.rows.map(function (row) {
          return hydrateDocument(_this2, row);
        });
      }, function (error) {
        return console.error(error);
      });
    }
    /**
     * Finds a single document by its id property
     *
     * @param {String} id of the document to retrieve
     * @param {Object} optional params
     * @return {Promise}
     * @api public
     */

  }, {
    key: "findById",
    value: function findById(id) {
      var _this3 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.db.get(id, params).then(function (raw) {
        return hydrateDocument(_this3, {
          value: raw
        });
      }, function (error) {
        return console.error(error);
      });
    }
    /**
     * Return the first element of the collection
     *
     * @param {Object} optional params
     * @return {Promise}
     * @api public
     */

  }, {
    key: "findFirst",
    value: function findFirst() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.findAll(params).then(function (documents) {
        if (documents.length) {
          return documents[0];
        }

        return null;
      });
    }
    /**
     *
     * @return {Promise}
     * @api public
     */

  }, {
    key: "where",
    value: function where(viewName) {
      var _this4 = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.dd.view(this.modelName, viewName, _objectSpread({
        include_docs: true
      }, params)).then(function (response) {
        return response.rows.map(function (row) {
          return hydrateDocument(_this4, row);
        });
      }, function (error) {
        console.error(error);
      });
    }
    /*!
     * Model init utility
     *
     * @param {String} modelName model name
     * @param {Schema} schema
     * @param {Connection} connection
     */

  }, {
    key: "init",
    value: function init(modelName, modelSchema, connection) {
      var schema = modelSchema instanceof _schema.default ? modelSchema : new _schema.default(modelSchema);
      schema.updateDesignDoc(modelName, connection.db); // Let's contruct the inner class representing this model

      var GeneratedModel = /*#__PURE__*/function (_Model) {
        _inherits(GeneratedModel, _Model);

        var _super2 = _createSuper(GeneratedModel);

        function GeneratedModel() {
          var _this5;

          var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          _classCallCheck(this, GeneratedModel);

          _this5 = _super2.call(this, data);
          _this5.modelName = modelName;
          _this5.schema = schema;
          _this5.connection = connection;
          applyVirtualsFromSchema(_assertThisInitialized(_this5), schema);
          attachHooksFromSchema(_assertThisInitialized(_this5), schema);
          return _this5;
        }

        return GeneratedModel;
      }(Model);

      applyMethodsFromSchema(GeneratedModel, schema);
      applyStaticsFromSchema(GeneratedModel, schema);
      /* TODO: should be done differently. Don't like to publish that information
        statically. Check what could happen with multiple connections.
        */

      GeneratedModel.modelName = modelName;
      GeneratedModel.schema = schema;
      GeneratedModel.connection = connection;
      GeneratedModel.db = connection.db;
      return GeneratedModel;
    }
  }]);

  return Model;
}(_document.default);

exports.default = Model;