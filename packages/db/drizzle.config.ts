import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './src/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.TTAI_DB_HOST ?? 'localhost',
    port: Number(process.env.TTAI_DB_PORT ?? 3307),
    database: process.env.TTAI_DB_NAME ?? 'ttai',
    user: process.env.TTAI_DB_USER ?? 'ttai',
    password: process.env.TTAI_DB_PASSWORD ?? 'ttai_dev_password',
  },
});
