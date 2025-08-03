import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const setting = sqliteTable("setting", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text().notNull(),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  notationMode: text().default("letter"), // or 'do-re-mi'
  keyboardLayout: text().default("qwerty"),
  showNoteColors: int({ mode: "boolean" }).default(true),
  noteColors: text({ mode: "json" }), // optional override of note colors
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
