export function sortObjectByKey(object) {
	return Object.keys(object)
		.sort()
		.reduce((sorted, key) => {
			sorted[key] = object[key];
			return sorted;
		}, {});
}
