import Recorder from "../src";

// Thank to babel-jest this call will be hoisted before above import
jest.disableAutomock();

describe("recorder", () => {
  describe("models", () => {
    it("should be defined with a name", () => {
      expect(() => {
        Recorder.model();
      }).toThrow(new Error("Naming your model is mandatory."));
    });

    it("should be retrieved only once being defined", () => {
      expect(() => {
        Recorder.model("User");
      }).toThrow(new Error("Model 'User' does not exist."));
    });

    it("should not be defined twice", () => {
      const schema = new Recorder.Schema({ name: String });

      // We don't want to actually really call couchdb to update designdocs.
      schema._designUpdated = true;

      Recorder.model("User", schema);

      expect(() => {
        Recorder.model("User", schema);
      }).toThrow(new Error("Model 'User' already exists. It can't be defined twice."));
    });
  });
});
