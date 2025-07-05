import { getChatMessages } from '@/lib/services/chat-service';

// GET /api/chats/[chatId]/messages - Get messages for a specific chat
export async function GET(request: Request, { chatId }: { chatId: string }) {
  try {
    if (!chatId) {
      return Response.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const messages = await getChatMessages(chatId);
    return Response.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
