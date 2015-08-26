jest.autoMockOff();

var recorder = require("../lib");

describe("recorder", function() {
  describe("models", function() {
    it("should be defined with a name", function() {
      expect(function() {
        recorder.model();
      }).toThrow(new Error("Naming your model is mandatory."));
    });

    it("should be retrieved only once being defined", function() {
      expect(function() {
        recorder.model("User");
      }).toThrow(new Error("Model 'User' does not exist."));
    });

    it("should not be defined twice", function() {
      var schema = new recorder.Schema({ name: String });

      // We don't want to actually really call couchdb to update designdocs.
      schema._designUpdated = true;

      recorder.model("User", schema);

      expect(function() {
        recorder.model("User", schema);
      }).toThrow(new Error("Model 'User' already exists. It can't be defined twice."));
    });
  });
});
