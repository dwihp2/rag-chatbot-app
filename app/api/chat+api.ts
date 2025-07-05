import { addMessage, createChat, generateChatTitle } from '@/lib/services/chat-service';
import { initializeSearchIndex, searchDocuments } from '@/lib/services/rag-service';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configuration: Minimum BM25 score threshold for considering knowledge relevant
// Lower values = more permissive, higher values = more strict
// Typical BM25 scores range from 0-10, with 0.5-1.0 being reasonable thresholds
const MIN_RELEVANCE_SCORE = 0.5;

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    // Debug log: Request details
    console.log('🚀 New Chat Request:', {
      chatId,
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1]
    });

    let currentChatId = chatId;

    // If no chatId provided, create a new chat
    if (!currentChatId) {
      const firstUserMessage = messages.find((msg: any) => msg.role === 'user')?.content || '';
      const title = generateChatTitle(firstUserMessage);
      const newChat = await createChat(title);
      currentChatId = newChat.id;
    }

    // Save the user message to database
    const userMessage = messages[messages.length - 1];
    if (userMessage?.role === 'user') {
      await addMessage(currentChatId, 'user', userMessage.content);
    }

    // Initialize RAG search index if not already done
    await initializeSearchIndex();

    // Search for relevant knowledge from RAG database
    const relevantChunks = await searchDocuments(userMessage?.content || '', 3);

    // Filter chunks based on relevance score threshold
    const highQualityChunks = relevantChunks.filter(chunk => chunk.score >= MIN_RELEVANCE_SCORE);

    // Debug log: Retrieved knowledge with scores
    console.log('🔍 RAG Knowledge Retrieved:', {
      query: userMessage?.content || '',
      totalChunks: relevantChunks.length,
      highQualityChunks: highQualityChunks.length,
      minThreshold: MIN_RELEVANCE_SCORE,
      chunks: relevantChunks.map((chunk, index) => ({
        index: index + 1,
        id: chunk.id,
        score: chunk.score,
        aboveThreshold: chunk.score >= MIN_RELEVANCE_SCORE,
        content: chunk.content.substring(0, 100) + '...',
        fullContent: chunk.content,
        metadata: chunk.metadata,
        createdAt: chunk.createdAt
      }))
    });

    // Debug log: Detailed scoring information
    if (relevantChunks.length > 0) {
      console.log('📊 Detailed Scoring Information:');
      relevantChunks.forEach((chunk, index) => {
        console.log(`  Chunk ${index + 1}:`, {
          id: chunk.id,
          score: chunk.score.toFixed(4),
          aboveThreshold: chunk.score >= MIN_RELEVANCE_SCORE ? '✅' : '❌',
          length: chunk.content.length,
          preview: chunk.content.substring(0, 150) + '...'
        });
      });
    } else {
      console.log('⚠️  No relevant chunks found for query:', userMessage?.content);
    }

    // Build context from relevant chunks
    let contextPrompt = '';
    if (highQualityChunks.length > 0) {
      contextPrompt = `

You are a helpful assistant that only answers questions based on the provided knowledge from the database. You must follow these strict rules:

1. ONLY use information from the knowledge provided below
2. If the knowledge doesn't contain information to answer the question, respond with "I don't have enough information in my knowledge base to answer that question."
3. Do not use your general knowledge or make assumptions beyond what's provided
4. Be precise and cite which knowledge section you're using

Based on the following knowledge from the database:

${highQualityChunks.map((chunk, index) => `
Knowledge ${index + 1} (Relevance Score: ${chunk.score.toFixed(4)}):
${chunk.content}
`).join('\n')}

Please answer the user's question using ONLY the information provided above. If the information is not sufficient or not present, say "I don't have enough information in my knowledge base to answer that question."

`;

      // Debug log: Context prompt being used
      console.log('📝 Context Prompt Generated:', {
        contextLength: contextPrompt.length,
        chunksUsed: highQualityChunks.length,
        averageScore: highQualityChunks.reduce((sum, chunk) => sum + chunk.score, 0) / highQualityChunks.length,
        context: contextPrompt
      });
    } else {
      // No high-quality chunks found, provide a context that instructs to say "don't know"
      contextPrompt = `

You are a helpful assistant with access to a knowledge database. Currently, I don't have any relevant information in my knowledge base to answer the user's question. 

Please respond with: "I don't have enough information in my knowledge base to answer that question. Could you please provide more context or ask about something else?"

`;
      console.log('❌ No high-quality chunks found - will respond with "don\'t know"');
    }

    // Prepare messages with RAG context
    const enhancedMessages = [...messages];
    if (userMessage?.role === 'user') {
      // Always insert the context before the last user message
      enhancedMessages[enhancedMessages.length - 1] = {
        ...userMessage,
        content: contextPrompt + userMessage.content
      };

      // Debug log: Final message being sent to AI
      console.log('🤖 Final Message to AI:', {
        hasContext: contextPrompt.length > 0,
        contextType: highQualityChunks.length > 0 ? 'knowledge-based' : 'no-knowledge',
        messageLength: enhancedMessages[enhancedMessages.length - 1].content.length
      });
    }

    // Generate AI response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: enhancedMessages,
      onFinish: async (result) => {
        // Save the assistant's response to database
        if (result.text) {
          await addMessage(currentChatId, 'assistant', result.text);
        }
      }
    });

    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
        'X-Chat-Id': currentChatId, // Return the chat ID in headers
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}