import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { db } from "./db";

migrate(db, { migrationsFolder: "./drizzle" });
