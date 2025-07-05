import { json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Chats table to store chat sessions
export const chats = pgTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table to store chat messages
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').references(() => chats.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'system', 'user', 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Documents/Knowledge table for storing RAG data
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Chunks table for storing document chunks for RAG
export const chunks = pgTable('chunks', {
  id: text('id').primaryKey(),
  documentId: text('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  embedding: json('embedding'), // Vector embedding for the chunk
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
