exports.list =
[
	/* / */

	{ pattern: /^\/$/, redirect: '/main/index' },
	
	/* /controller/action */

	{ pattern: /^\/([a-z0-9]+)\/([a-z0-9]+)$/i, args: { controller: '$1', action: '$2' } },

	/* assets */

	{ pattern: /^.+\.(css|js|jpg|png|ico)$/i, args: { controller: 'asset', action: 'load', path: '$0' } }
];