import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.DwKpxwaf.js","_app/immutable/chunks/scheduler.Dv8i6wGV.js","_app/immutable/chunks/index.BVPUwun-.js","_app/immutable/chunks/utils.DsjfN84j.js"];
export const stylesheets = [];
export const fonts = [];
