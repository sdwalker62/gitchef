// import { sqlite3InitModule } from '$lib/sqlite/jswasm/sqlite3.js';
import type { DB } from 'sqlite3oo1';

const DB_NAME = 'file:///recipes.sqlite';
export let db: DB;

declare global {
	function sqlite3InitModule(options: { print: object; printErr: object }): Promise<void>;
}

export async function initDb() {
	console.log('Loading sqlite3 module...');
	await import('$lib/sqlite/jswasm/sqlite3.mjs');
	console.log('Initializing sqlite3 module...');
	let sqlite3: any = await self.sqlite3InitModule({ print: console.log, printErr: console.error });
	const oo = sqlite3?.oo1 as any;
	const c_api = sqlite3.capi as any;
	const opfsFound = c_api.sqlite3_vfs_find('opfs');
	console.log(sqlite3);

	if (opfsFound) {
		db = new oo.OpfsDb(DB_NAME) as DB;
		console.log('The OPFS is available.');
	} else {
		// fallback to non-persistent opfs storage
		// you might not want to do this and instead show a message to the user that the app is not available offline
		db = new oo.DB(DB_NAME, 'ct') as DB;
		console.log('The OPFS is not available.');
	}
	console.log('transient db =', (db as any).filename);
	db.exec(['PRAGMA journal_mode = wal;', 'PRAGMA synchronous = normal;']);
}
