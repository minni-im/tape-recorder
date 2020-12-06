import nano from "nano";

export default class Connection {
	constructor(base) {
		this.base = base;
	}

	/**
	 * Open the connection to couchdb
	 */
	async open(url, database, options = {}) {
		const conn = nano({ url, ...options });
		try {
			await conn.db.get(database);
		} catch (err) {
			console.error(`'${database}' does not exist!`);
			console.log(`Creating '${database}'`);
			await conn.db.create(database);
		} finally {
			this.db = conn.use(database);
		}
	}

	model(name, schema) {
		const model = this.base.model(name, schema);
		this.models[name] = model;
		return model;
	}
}
