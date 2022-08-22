import { suite } from "uvu";
import * as assert from "uvu/assert";
import nano from "nano";

import recorder, {
	Schema,
	RecorderError,
	RecorderOverwriteModelError,
	RecorderMissingSchemaError,
	RecorderModelNotFoundError,
} from "./index.js";

const COUCH_HOST = process.env.COUCH_HOST || "http://localhost:15984";
const COUCH_USER = process.env.COUCH_USER || "admin";
const COUCH_PWD = process.env.COUCH_PWD || "password";
const COUCH_DB = "uvu";

const CONNECTION = () => ({
	url: `${COUCH_HOST}/${COUCH_DB}-${Date.now()}`,
	requestDefaults: {
		auth: {
			username: COUCH_USER,
			password: COUCH_PWD,
		},
	},
});

const SETUP = (suite) => {
	suite.before((context) => {
		const { registerModel, model } = recorder(context.info);
		context.registerModel = registerModel;
		context.model = model;
	});
};

const TEARDOWN = (suite) => {
	suite.after((context) => {
		const connection = nano(context.info);
		const database = connection.config.db;

		queueMicrotask(async () => {
			const all_dbs = await connection.server.db.list();
			if (all_dbs.includes(database)) {
				await connection.server.db.destroy(database);
			}
		});
	});
};

const main = suite("recorder");

main("should throw if called without argument", () => {
	try {
		recorder();
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderError);
		assert.ok(err.message, "missing couchdb endpoint url");
	}
});

main("should throw if called with non-url argument", () => {
	try {
		recorder("woot");
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderError);
		assert.ok(err.message, "invalid couchdb endpoint url");
	}
});

main("should throw if called without dbname", () => {
	try {
		recorder("http://localhost:5984");
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderError);
		assert.ok(err.message, "missing database name from endpoint url");
	}
});

main("should return proper api", () => {
	const instance = recorder("http://localhost:5984/foo");
	assert.ok(instance);
	assert.type(instance, "object");
	assert.ok(instance.registerModel);
	assert.ok(instance.model);
	assert.type(instance.registerModel, "function");
	assert.type(instance.model, "function");
});

main.run();

const schema = suite("schema definition");
schema("should be created", () => {
	const _ = new Schema({
		firstName: String,
		email: String,
	});
	assert.ok(_);
	assert.ok(_.descriptor);
	assert.ok(_.statics);
	assert.ok(_.methods);
	assert.ok(_.views);
	assert.ok(_.virtuals);
});

schema("should normalise default values", () => {
	const _ = new Schema({
		a: String,
		b: {
			type: String,
			default: "b",
		},
		c: {
			type: Number,
			default: 1,
		},
		d: {
			type: Array,
			default: () => [],
		},
		e: {
			type: Object,
			default: () => ({}),
		},
		f: {
			type: Boolean,
			default: true,
		},
		g: {
			type: String,
		},
	});
	assert.equal(_.defaultValue("a"), undefined);
	assert.equal(_.defaultValue("b"), "b");
	assert.equal(_.defaultValue("c"), 1);
	assert.equal(_.defaultValue("d"), []);
	assert.equal(_.defaultValue("e"), {});
	assert.equal(_.defaultValue("f"), true);
	assert.equal(_.defaultValue("g"), undefined);
});

schema("should allow defining methods", () => {
	const method = () => {};
	const _ = new Schema({});
	_.method("foo", method);
	assert.ok(_.methods.has("foo"));
	assert.equal(_.methods.get("foo"), method);
});

schema("should allow defining statics", () => {
	const method = () => {};
	const _ = new Schema({});
	_.static("foo", method);
	assert.ok(_.statics.has("foo"));
	assert.equal(_.statics.get("foo"), method);
});

schema("should allow defining read-only virtuals", () => {
	const get = () => {};
	const _ = new Schema({});
	_.virtual("foo", { get });
	assert.ok(_.virtuals.has("foo"));
	assert.ok(_.virtuals.get("foo").get);
	assert.not.ok(_.virtuals.get("foo").set);
	assert.equal(_.virtuals.get("foo").get, get);
});

schema("should allow defining read/write virtuals", () => {
	const method = () => {};
	const _ = new Schema({});
	_.virtual("foo", { get: method, set: method });
	assert.ok(_.virtuals.has("foo"));
	assert.ok(_.virtuals.get("foo").get);
	assert.ok(_.virtuals.get("foo").set);

	assert.equal(_.virtuals.get("foo").get, method);
	assert.equal(_.virtuals.get("foo").set, method);
});

schema("should allow defining views", () => {
	const map = `string`;
	const reduce = "_count";
	const _ = new Schema({});
	_.view("foo", map, reduce);
	assert.ok(_.views.has("foo"));
	assert.type(_.views.get("foo"), "object");
	assert.ok(_.views.get("foo").map);
	assert.equal(_.views.get("foo").map, map);
	assert.ok(_.views.get("foo").reduce);
	assert.equal(_.views.get("foo").reduce, reduce);
});
schema.run();

const registration = suite("model registration", { info: CONNECTION() });
SETUP(registration);
TEARDOWN(registration);

registration("should throw if name not provided", ({ registerModel }) => {
	try {
		registerModel();
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderError);
	}
});

registration("should throw if schema not provided", ({ registerModel }) => {
	try {
		registerModel("User");
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderMissingSchemaError);
	}
});

registration("should throw if model already exists", ({ registerModel }) => {
	registerModel("User", new Schema({}));
	try {
		registerModel("User", new Schema({}));
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderOverwriteModelError);
	}
});

registration("should be registered", ({ registerModel, model }) => {
	const Profile = registerModel("Profile", new Schema({}));
	const ProfileRetrieved = model("Profile");
	assert.ok(Profile);
	assert.ok(ProfileRetrieved);
	assert.equal(Profile, ProfileRetrieved);
});

registration("should apply methods from schema", ({ registerModel }) => {
	const UserWithMethod = new Schema({});
	UserWithMethod.method("foo", () => {});
	const User = registerModel("UserWithMethod", UserWithMethod);
	const user = new User();
	assert.ok(user.foo);
	assert.type(user.foo, "function");
});

registration("should apply statics from schema", ({ registerModel }) => {
	const UserWithStatics = new Schema({});
	UserWithStatics.static("foo", () => {});
	const User = registerModel("UserWithStatics", UserWithStatics);
	assert.ok(User.foo);
	assert.type(User.foo, "function");
});

registration("should apply virtuals from schema", ({ registerModel }) => {
	const UserWithVirtuals = new Schema({});
	UserWithVirtuals.virtual("foo", {
		get() {
			return "bar";
		},
		set(value) {
			assert.equal(value, "baz");
		},
	});
	const User = registerModel("UserWithVirtuals", UserWithVirtuals);
	const user = new User();
	assert.ok(user.foo);
	assert.equal(user.foo, "bar");
	user.foo = "baz";
});

registration.run();

const model = suite("model usage", { info: CONNECTION() });
SETUP(model);
TEARDOWN(model);

model("should throw if called with no argument", ({ model }) => {
	try {
		model();
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderError);
	}
});

model("should throw if model does not exist", ({ model }) => {
	try {
		model("User");
	} catch (err) {
		assert.ok(err);
		assert.instance(err, RecorderModelNotFoundError);
	}
});

model("should create document", async ({ registerModel }) => {
	const User = registerModel("SaveUser", {
		name: String,
	});
	const user = new User({ name: "Benoit" });
	assert.not.ok(user._id);
	await user.save();
	assert.ok(user.id);
	assert.ok(user.rev);
});

model("should update document", async ({ registerModel }) => {
	const User = await registerModel("UpdateUser", {
		name: String,
	});
	const user = new User({ name: "Benoit" });
	await user.save();
	user.name = "Benedetto";
	await user.save();
	assert.ok(user.rev);
	assert.ok(user.rev.startsWith("2-"));
});

model("should delete document", async ({ info, registerModel }) => {
	const User = await registerModel("DeleteUser", {
		name: String,
	});
	const user = new User({ name: "Benoit" });
	await user.save();

	await user.delete();

	const connection = nano(info);

	try {
		await connection.get(user.id);
	} catch (err) {
		assert.ok(err);
		assert.instance(err, Error);
	}
});

model.run();
