import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const scale = sqliteTable("scale", {
  id: text().primaryKey(), // e.g. C_maj7
  root: text().notNull(), // C, D#, etc.
  type: text().notNull(), // maj, min7, etc.
  notes: text().notNull(), // comma-separated: 'C,E,G,B'
  midi: text(), // optional: '60,64,67,71'
  name: text().notNull(),
  description: text(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
