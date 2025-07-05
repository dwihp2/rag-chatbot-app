import { createChat, deleteChat, getAllChats, updateChatTitle } from '@/lib/services/chat-service';

// GET /api/chats - Get all chats
export async function GET() {
  try {
    const chats = await getAllChats();
    return Response.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return Response.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const newChat = await createChat(title);
    return Response.json({ chat: newChat });
  } catch (error) {
    console.error('Error creating chat:', error);
    return Response.json({ error: 'Failed to create chat' }, { status: 500 });
  }
}

// PUT /api/chats - Update chat title
export async function PUT(request: Request) {
  try {
    const { chatId, title } = await request.json();

    if (!chatId || !title) {
      return Response.json({ error: 'Chat ID and title are required' }, { status: 400 });
    }

    const updatedChat = await updateChatTitle(chatId, title);

    if (!updatedChat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }

    return Response.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return Response.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

// DELETE /api/chats - Delete a chat
export async function DELETE(request: Request) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return Response.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    await deleteChat(chatId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return Response.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}
