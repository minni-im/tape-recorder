jest.dontMock("../lib/index");
jest.dontMock("../lib/schema");

var recorder = require("../lib/index");

describe("Schema", function() {
  var User, schema;

  beforeEach(function() {
    schema = {
      firstName: String,
      lastName: {
        type: String,
        "default": "Doe"
      },
      birthDate: {
        type: Date,
        default: function() {
          return new Date();
        }
      }
    };
    User = new recorder.Schema(schema);
  });


  it("should be normalized on construction", function() {
      expect(User.schema.firstName.type).toBe(String);
      expect(User.schema.lastName.type).toBe(String);
      expect(User.schema.birthDate.default).toBeDefined();
      expect(typeof User.schema.birthDate.default).toBe("function");
      expect(User.schema.birthDate.default).toBe(schema.birthDate.default);
  });

  it("should return proper default value when calling `getDefaultFunction()`", function() {
    expect(User.getDefaultFunction("lastName").call(User)).toBe("Doe");
  });

  it("should be possible to alter a Schema instance with `add()`", function() {
    User.add({
      nickName: String
    });
    expect(User.schema.nickName).toBeDefined();
    expect(User.schema.nickName.type).toBe(String);
  });

  describe("methods", function() {
    function getAge() {
      var now = new Date().getFullYear();
      return now - new Date(this.birthDate).getFullYear();
    }

    it("should be added via `method(name, fn)` calls", function() {
      User.method("age", getAge);
      expect(Object.keys(User.methods).length).toBe(1);
      expect(User.methods.age).toBeDefined();
      expect(User.methods.age).toBe(getAge);
    });

    it("should understand calls using `methods({ ... })`", function() {
      User.method({
        "age": getAge
      });
      expect(Object.keys(User.methods).length).toBe(1);
      expect(User.methods.age).toBeDefined();
      expect(User.methods.age).toBe(getAge);
    });

  });

  describe("virtuals", function() {
    function fullNameGetter() {
      return this.firstName + " " + this.lastName;
    }

    function nickNameGetter() {
      return "Ben";
    }

    it("should be added via `virtual(name, getter)`", function() {
      User.virtual("fullName", fullNameGetter);

      expect(Object.keys(User.virtuals).length).toBe(1);
      expect(User.virtuals.fullName).toBeDefined();
      expect(User.virtuals.fullName.get).toBe(fullNameGetter);
    });

    it("should understand calls to `virtual({ ... })`", function() {
      User.virtual({
        "fullName": { get: fullNameGetter },
        "nickName": { get: nickNameGetter }
      });
      expect(Object.keys(User.virtuals).length).toBe(2);
      expect(User.virtuals.fullName).toBeDefined();
      expect(User.virtuals.fullName.get).toBe(fullNameGetter);

      expect(User.virtuals.nickName).toBeDefined();
      expect(User.virtuals.nickName.get).toBe(nickNameGetter);
    });


  });

  describe("statics", function () {
    function findByFullName() {}
    function findByAge() {}

    it("should be defined via `static()` calls", function() {
      User.static("findByFullName", findByFullName);
      expect(Object.keys(User.statics).length).toBe(1);
      expect(User.statics.findByFullName).toBe(findByFullName);
    });

    it("should understand calls via `static({ ..})`", function() {
      User.static({
        findByFullName: findByFullName,
        findByAge: findByAge
      });
      expect(Object.keys(User.statics).length).toBe(2);
      expect(User.statics.findByFullName).toBe(findByFullName);
      expect(User.statics.findByAge).toBe(findByAge);
    });
  });

  describe("custom couchdb views", function () {
    it("should be defined via `view()` calls", function() {
      var viewDefinition = {
        map: function() {},
        reduce: function() {}
      };
      User.view("fullName", viewDefinition);
      expect(User.views.fullName).toBeDefined();
      expect(User.views.fullName.map).toBe(viewDefinition.map);
      expect(User.views.fullName.reduce).toBe(viewDefinition.reduce);
    });
  });

});
