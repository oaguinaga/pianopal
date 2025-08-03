import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const setting = sqliteTable("setting", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text().notNull(),
  // userId: text().notNull(),
  notationMode: text().default("letter"), // or 'do-re-mi'
  keyboardLayout: text().default("qwerty"),
  showNoteColors: int({ mode: "boolean" }).default(true),
  noteColors: text({ mode: "json" }), // optional override of note colors
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
