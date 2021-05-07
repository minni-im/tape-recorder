import { suite } from "uvu";
import * as assert from "uvu/assert";
import fetch from "node-fetch";

import recorder from "../src/index.js";

console.error = () => {};

function createSuiteWithConnection(suiteName, context = { dbName: "test" }) {
	const tests = suite(suiteName, context);
	const { dbName } = context;
	tests.before(async (context) => {
		Object.assign(context, await recorder("http://localhost:5984", dbName));
	});
	tests.after(async (context) => {
		await context.connection.db.destroy(dbName);
	});
	return tests;
}

//██╗     ██╗██████╗ ██████╗  █████╗ ██████╗ ██╗   ██╗
//██║     ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
//██║     ██║██████╔╝██████╔╝███████║██████╔╝ ╚████╔╝
//██║     ██║██╔══██╗██╔══██╗██╔══██║██╔══██╗  ╚██╔╝
//███████╗██║██████╔╝██║  ██║██║  ██║██║  ██║   ██║
//╚══════╝╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
const lib = suite("Recorder initialisation", {});

lib.before(async (context) => {
	context.instance = await recorder();
});
lib("is defined", ({ instance }) => {
	assert.ok(instance);
	assert.type(instance, "object");

	["connection", "getModel", "defineSchema", "registerModel"].forEach((method) => {
		assert.ok(instance[method]);
	});
});

lib("connects by default to localhost", async ({ instance }) => {
	const { config } = instance.connection;
	assert.ok(config);
	assert.equal(config.url, "http://localhost:5984");
});

lib.run();

// ███████╗ ██████╗██╗  ██╗███████╗███╗   ███╗ █████╗
// ██╔════╝██╔════╝██║  ██║██╔════╝████╗ ████║██╔══██╗
// ███████╗██║     ███████║█████╗  ██╔████╔██║███████║
// ╚════██║██║     ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══██║
// ███████║╚██████╗██║  ██║███████╗██║ ╚═╝ ██║██║  ██║
// ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝
const schema = createSuiteWithConnection("Schema creation");

schema("defineSchema method is defined", ({ defineSchema }) => {
	assert.ok(defineSchema);
	assert.type(defineSchema, "function");
});

schema("returns a valid Schema instance", ({ defineSchema }) => {
	const schema = defineSchema({
		firstname: String,
	});
	assert.ok(schema);
	["method", "static", "virtual", "view"].forEach((method) => {
		assert.ok(schema[method]);
	});
});

schema("throws en error on empty schema", ({ defineSchema }) => {
	const emptySchema = () => defineSchema();
	assert.throws(() => emptySchema());
});

schema("register a method with method(String)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.method("dothething", method);
	assert.ok(schema.methods.dothething);
	assert.equal(schema.methods.dothething, method);
});

schema("register multiple methods with method(Map)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.method({
		dothething: method,
		dotheotherthing: method,
	});
	assert.equal(Object.keys(schema.methods).length, 2);
	assert.ok(schema.methods.dothething);
	assert.ok(schema.methods.dotheotherthing);
	assert.equal(schema.methods.dothething, method);
	assert.equal(schema.methods.dotheotherthing, method);
});

schema("register a static method with static(String)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.static("compute", method);
	assert.ok(schema.statics.compute);
	assert.equal(schema.statics.compute, method);
});

schema("register multiple statics with static(Map)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.static({
		dothething: method,
		dotheotherthing: method,
	});
	assert.equal(Object.keys(schema.statics).length, 2);
	assert.ok(schema.statics.dothething);
	assert.ok(schema.statics.dotheotherthing);
	assert.equal(schema.statics.dothething, method);
	assert.equal(schema.statics.dotheotherthing, method);
});

schema("register a virtual accessor with virtual(name, get, set)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.virtual("amireal", method, method);
	assert.ok(schema.virtuals.amireal);
	assert.equal(schema.virtuals.amireal, { get: method, set: method });
});

schema("register multiple virtual accessors with virtual(Map)", ({ defineSchema }) => {
	const method = () => {};
	const schema = defineSchema({});
	schema.virtual({
		amireal: { get: method, set: method },
		arewe: { get: method, set: method },
	});
	assert.equal(Object.keys(schema.virtuals).length, 2);
	assert.ok(schema.virtuals.amireal);
	assert.ok(schema.virtuals.arewe);
	assert.equal(schema.virtuals.amireal, { get: method, set: method });
	assert.equal(schema.virtuals.arewe, { get: method, set: method });
});

schema.run();

// ██████╗ ███████╗███████╗██╗ ██████╗ ███╗   ██╗
// ██╔══██╗██╔════╝██╔════╝██║██╔════╝ ████╗  ██║
// ██║  ██║█████╗  ███████╗██║██║  ███╗██╔██╗ ██║
// ██║  ██║██╔══╝  ╚════██║██║██║   ██║██║╚██╗██║
// ██████╔╝███████╗███████║██║╚██████╔╝██║ ╚████║
// ╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
const design = createSuiteWithConnection("Model registration");

design("creates a valid default designDoc", async ({ dbName, registerModel }) => {
	const modelName = "User";
	await registerModel(modelName, {
		firstname: String,
	});
	const response = await fetch(`http://localhost:5984/${dbName}/_design/${modelName}`);
	assert.is(response.status, 200);
	const doc = await response.json();
	assert.ok(doc);
	assert.equal(doc.language, "javascript");
	assert.ok(doc.views.all);
	assert.equal(doc.views.all.map, `function(doc) { if (doc.modelType === "User") { emit(doc._id, null); } }`);
});

design("defines custom views in designDoc", async ({ dbName, defineSchema, registerModel }) => {
	const modelName = "User";
	await registerModel(
		modelName,
		defineSchema({
			firstname: {
				type: String,
				view: true,
			},
		}),
	);
	const doc = await fetch(`http://localhost:5984/${dbName}/_design/${modelName}`).then((r) => r.json());
	assert.ok(doc);
	assert.ok(doc.views.firstname);
	assert.equal(
		doc.views.firstname.map,
		`function(doc) { if (doc.modelType === "${modelName}" && doc.firstname) { emit(doc.firstname, null); } }`,
	);
});

design("registerModel stores returned model onto registry", async ({ defineSchema, registerModel, getModel }) => {
	const modelName = "User";
	const UserSchema = defineSchema({});
	const UserModel = await registerModel(modelName, UserSchema);
	assert.equal(UserModel, getModel(modelName));
});

design.run();

// ███╗   ███╗ ██████╗ ██████╗ ███████╗██╗
// ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║
// ██╔████╔██║██║   ██║██║  ██║█████╗  ██║
// ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║
// ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗
// ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
const model = createSuiteWithConnection("Model usage");

model.before.each(async (context) => {
	context.User = await context.registerModel("User", {
		firstname: String,
	});
});

model("creates model with static methods", async ({ User }) => {
	["findById", "findFirst", "findAll", "where"].forEach((method) => {
		assert.ok(User[method]);
		assert.type(User[method], "function");
	});
});

model("makes advantage of default values", async ({ registerModel }) => {
	const Animal = await registerModel("Animal", {
		race: {
			type: String,
			default: "jack russel",
		},
		color: {
			type: String,
			default: () => "white",
		},
	});
	const doggo = new Animal();
	const serialised = doggo.toJSON();
	assert.ok(serialised);
	assert.equal(serialised.race, "jack russel");
	assert.equal(serialised.color, "white");
});

model("update document with id and rev on initial save", async ({ User }) => {
	const user = new User({ firstname: "benoit" });
	await user.save();
	assert.ok(user._id);
	assert.ok(user._rev);
	assert.type(user._id, "string");
	assert.type(user._rev, "string");

	await user.delete();
});

model("throws error if save() is called with wrong _rev", async ({ User }) => {
	const user = new User({ firstname: "benoit" });
	await user.save();
	const { _rev } = user;
	user._rev = "fakeone";
	try {
		await user.save();
		assert.unreachable("never goes there");
	} catch (err) {
		assert.ok("threw error");
		assert.instance(err, Error);
	}

	// Cleanup
	user._rev = _rev;
	await user.delete();
});

model("throws error if delete() is called without a _rev", async ({ User }) => {
	const user = new User({ firstname: "benoit" });
	// Never saved intially, so no _id, nor _rev
	try {
		await user.delete();
		assert.unreachable("never goes there");
	} catch (err) {
		assert.ok("threw error");
		assert.instance(err, Error);
	}
});

model("throws error if delete() is called with wrong _id or _rev", async ({ User }) => {
	const user = new User({ firstname: "benoit" });
	await user.save();
	const { _id } = user;
	user._id = "fakeone";
	try {
		await user.delete();
		assert.unreachable("never goes there");
	} catch (err) {
		assert.ok("threw error");
		assert.instance(err, Error);
	}

	// Cleanup
	user._id = _id;
	await user.delete();
});

model("can findById", async ({ User }) => {
	const user = new User({ firstname: "benoit" });
	await user.save();

	const fetched = await User.findById(user._id);
	assert.ok(fetched);
	assert.equal(user._id, fetched._id);
	assert.equal(user._rev, fetched._rev);
	assert.equal(user.firstname, fetched.firstname);
	assert.equal(user.dateCreated.toISOString(), fetched.dateCreated);
	assert.equal(user.lastUpdated.toISOString(), fetched.lastUpdated);

	await user.delete();
});

model("throws an error with findById with invalid/unknown id", async ({ User }) => {
	try {
		await User.findById("thisdoesnotexistindb");
		assert.unreachable("should have thrown");
	} catch (err) {
		assert.ok("threw error");
		assert.instance(err, Error);
	}
});

model("returns empty array on findAll with no result", async ({ User }) => {
	const all = await User.findAll();
	assert.ok(all);
	assert.equal(all, []);
});

model("can findAll", async ({ User }) => {
	const john = new User({ firstname: "john" });
	const jane = new User({ firstname: "jane" });
	await john.save();
	await jane.save();
	const all = await User.findAll();
	assert.equal(all.length, 2);
	assert.equal(all[0].firstname, "john");
	assert.equal(all[1].firstname, "jane");

	await john.delete();
	await jane.delete();
});

model("can findFirst", async () => {});

model("can use specified view", async () => {});

model.run();
