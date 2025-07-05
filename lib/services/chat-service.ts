import { desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { chats, messages } from '../db/schema';

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

// Create a new chat
export async function createChat(title: string = 'New Chat'): Promise<Chat> {
  const chatId = nanoid();

  const [newChat] = await db.insert(chats).values({
    id: chatId,
    title,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return newChat;
}

// Get all chats ordered by most recent
export async function getAllChats(): Promise<Chat[]> {
  const allChats = await db
    .select()
    .from(chats)
    .orderBy(desc(chats.updatedAt));

  return allChats;
}

// Get a specific chat by ID
export async function getChatById(chatId: string): Promise<Chat | null> {
  const result = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  return result[0] || null;
}

// Update chat title
export async function updateChatTitle(chatId: string, title: string): Promise<Chat | null> {
  const [updatedChat] = await db
    .update(chats)
    .set({
      title,
      updatedAt: new Date()
    })
    .where(eq(chats.id, chatId))
    .returning();

  return updatedChat || null;
}

// Delete a chat and all its messages
export async function deleteChat(chatId: string): Promise<void> {
  await db.delete(chats).where(eq(chats.id, chatId));
  // Messages will be deleted automatically due to cascade delete
}

// Add a message to a chat
export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
  const messageId = nanoid();

  const [newMessage] = await db.insert(messages).values({
    id: messageId,
    chatId,
    role,
    content,
    createdAt: new Date(),
  }).returning();

  // Update the chat's updatedAt timestamp
  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(eq(chats.id, chatId));

  return {
    ...newMessage,
    role: newMessage.role as 'user' | 'assistant'
  };
}

// Get all messages for a chat
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  return chatMessages.map(msg => ({
    ...msg,
    role: msg.role as 'system' | 'user' | 'assistant'
  }));
}

// Generate a title for a chat based on the first user message
export function generateChatTitle(firstMessage: string): string {
  // Take the first 50 characters and truncate at word boundary
  const truncated = firstMessage.substring(0, 50);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 20) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + (firstMessage.length > 50 ? '...' : '');
}