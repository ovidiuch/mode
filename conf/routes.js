exports.list =
[
	{ pattern: /\/([a-z0-9]+)\/([a-z0-9]+)/i, args: { controller: '$1', action: '$2' } }
];