const childProcess = require("node:child_process");
const path = require("node:path");

/**
 * The project `postinstall` hook is in charge of preparing as well as
 * calling the `tape-recorder generate` command.
 */
async function main() {
	process.env.RECORDER_GENERATE_IN_POSTINSTALL = "true";
	const packagePath = getPackagePath();
	const binScript = path.join(packagePath, "bin", "cli.js");
	try {
		if (packagePath) {
			await run("node", [binScript, "generate", "--postinstall"]);
			return;
		}
	} catch (error) {
		if (error) {
			console.error(error);
		}
	}
}

function getPackagePath() {
	try {
		const packagePath = require.resolve("@minni-im/tape-recorder/package.json");
		if (packagePath) {
			return require.resolve("@minni-im/tape-recorder");
		}
	} catch (e) {} // eslint-disable-line no-empty
	return null;
}

function run(cmd, params, cwd = process.cwd()) {
	const child = childProcess.spawn(cmd, params, {
		stdio: ["pipe", "inherit", "inherit"],
		cwd,
	});

	return new Promise((resolve, reject) => {
		child.on("close", () => {
			resolve();
		});
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(code);
			}
		});
		child.on("error", () => {
			reject();
		});
	});
}
