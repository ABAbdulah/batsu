import "server-only";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import * as authSchema from "./auth-schema";
import * as appSchema from "./schema";

const schema = { ...appSchema, ...authSchema };

// Neon in production (WebSocket pool, so checkout gets real transactions); plain Postgres locally.
// No DATABASE_URL → `db` is null and reads fall back to the static catalogue snapshot.
function connect(url: string) {
  if (new URL(url).hostname.endsWith(".neon.tech")) {
    return drizzleNeon(new NeonPool({ connectionString: url }), { schema });
  }
  return drizzlePg(new PgPool({ connectionString: url, max: 5 }), { schema }) as unknown as ReturnType<typeof drizzleNeon<typeof schema>>;
}

const globalForDb = globalThis as unknown as { batsuDb?: ReturnType<typeof connect> };

export const db = process.env.DATABASE_URL ? (globalForDb.batsuDb ??= connect(process.env.DATABASE_URL)) : null;
export type Db = NonNullable<typeof db>;
export { schema };
