import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const favorite = sqliteTable("favorite", {
  id: int().primaryKey({ autoIncrement: true }),
  // userId: text().notNull(),
  itemId: int().notNull(), // chord.id or scale.id
  itemType: text().notNull(), // 'chord' or 'scale'
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});
