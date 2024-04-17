import { Client, Pool } from 'pg';
const pool = new Pool({
	user: 'xxx',
	host: 'xxx',
	database: 'xxx',
	password: 'xxx',
	port: 5432
});
export const connectToDB = async () => await pool.connect();
