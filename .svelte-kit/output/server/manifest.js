export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.l90MTy1Z.js","app":"_app/immutable/entry/app.CbcWFo4Y.js","imports":["_app/immutable/entry/start.l90MTy1Z.js","_app/immutable/chunks/entry.BL9rqRkl.js","_app/immutable/chunks/scheduler.Dv8i6wGV.js","_app/immutable/chunks/index.CUgiiOKI.js","_app/immutable/entry/app.CbcWFo4Y.js","_app/immutable/chunks/scheduler.Dv8i6wGV.js","_app/immutable/chunks/index.BVPUwun-.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/profile/[...profile]",
				pattern: /^\/profile(?:\/(.*))?\/?$/,
				params: [{"name":"profile","optional":false,"rest":true,"chained":true}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
