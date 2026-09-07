import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const successfulPlayers = sqliteTable('successful_players', {
  visitorId: text('visitor_id').primaryKey(),
  firstSuccessAt: integer('first_success_at').notNull(),
});
