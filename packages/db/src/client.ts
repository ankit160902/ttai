import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema/index.js';

const poolConnection = mysql.createPool({
  host: process.env.TTAI_DB_HOST ?? 'localhost',
  port: Number(process.env.TTAI_DB_PORT ?? 3307),
  database: process.env.TTAI_DB_NAME ?? 'ttai',
  user: process.env.TTAI_DB_USER ?? 'ttai',
  password: process.env.TTAI_DB_PASSWORD ?? 'ttai_dev_password',
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
export type Database = typeof db;
