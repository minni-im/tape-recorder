#!/usr/bin/env node

async function main() {
	const isPostInstall = process.env.RECORDER_GENERATE_IN_POSTINSTALL === "true";

	if (isPostInstall) {
		console.log("👋 from postinstall script!");
	} else {
		console.log("👋 from cli");
	}
}

process.on("SIGINT", () => {
	process.exit(0);
});

main()
	.then((code) => {
		if (code !== 0) {
			process.exit(code);
		}
	})
	.catch((err) => {
		console.error(err.message);
		process.exit(1);
	});
