import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    xp: int("xp").notNull()
});

export type User = typeof users.$inferSelect;
