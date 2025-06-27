/*
<ai_context>
Defines the database schema for contacts.
</ai_context>
*/

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const contactsTable = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type InsertContact = typeof contactsTable.$inferInsert
export type SelectContact = typeof contactsTable.$inferSelect
