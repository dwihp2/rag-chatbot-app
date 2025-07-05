import { createChat, getAllChats } from '@/lib/services/chat-service';

export async function GET() {
  try {
    // Test creating a chat
    const testChat = await createChat('Test Chat');
    console.log('Created test chat:', testChat);

    // Test getting all chats
    const allChats = await getAllChats();
    console.log('All chats:', allChats);

    return Response.json({
      success: true,
      testChat,
      allChats,
      message: 'Database connection test successful'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
