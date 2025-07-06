import { addMessage, createChat, generateChatTitle } from '@/lib/services/chat-service';
import { embeddingSearch, initializeEnhancedRAG } from '@/lib/services/enhanced-rag-service';
import { buildKnowledgeContext, RAG_SYSTEM_PROMPT, shouldProvideKnowledgeResponse } from '@/lib/services/rag-prompts';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

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

    // Initialize Enhanced RAG system if not already done
    await initializeEnhancedRAG();

    // Perform embedding search for relevant knowledge
    const searchResults = await embeddingSearch(userMessage?.content || '', 3);

    // Debug log: Search results
    console.log('🔍 Embedding Search Results:', {
      query: userMessage?.content || '',
      totalResults: searchResults.length,
      results: searchResults.map((result, index) => ({
        index: index + 1,
        id: result.chunk.id,
        score: result.score.toFixed(4),
        source: result.source,
        preview: result.chunk.content.substring(0, 100) + '...'
      }))
    });

    // Determine if we have sufficient knowledge to answer
    const hasRelevantKnowledge = shouldProvideKnowledgeResponse(searchResults);

    let enhancedMessages = [...messages];

    if (hasRelevantKnowledge) {
      // Build knowledge context
      const knowledgeContext = buildKnowledgeContext(searchResults);

      // Enhance the user message with knowledge context and system prompt
      enhancedMessages[enhancedMessages.length - 1] = {
        ...userMessage,
        content: `${RAG_SYSTEM_PROMPT}\n\n${knowledgeContext}User Question: ${userMessage.content}`
      };

      console.log('✅ Enhanced message with knowledge context:', {
        contextLength: knowledgeContext.length,
        resultsUsed: searchResults.length,
        averageScore: searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
      });
    } else {
      // No relevant knowledge found - return simple "I don't know" response
      console.log('❌ No relevant knowledge found - providing simple fallback response');

      // Create a simple fallback response
      const fallbackResponse = "I don't have information about that topic in my culinary knowledge base. I'm specialized in helping with recipes, cooking techniques, and food-related questions.\n\nCould you ask me about:\n- Specific recipes or cooking methods\n- Ingredient substitutions\n- Cooking techniques\n- Food safety tips\n\nOr you can upload cookbooks and recipe collections to expand my knowledge base!";

      // Save the simple response to database
      await addMessage(currentChatId, 'assistant', fallbackResponse);

      // Return streaming response using AI SDK format
      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: 'system',
            content: 'You are a helpful culinary assistant. You must respond with exactly the provided text, word for word, without any modifications or additions.'
          },
          {
            role: 'user',
            content: `Please respond with exactly this text: "${fallbackResponse}"`
          }
        ],
        temperature: 0,
        maxTokens: 300,
      });

      return result.toDataStreamResponse({
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'none',
          'X-Chat-Id': currentChatId,
        },
      });
    }

    // Generate AI response (only when we have relevant knowledge)
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: enhancedMessages,
      temperature: 0.5,
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
    console.error('Error in enhanced chat API:', error);

    // Handle specific OpenAI errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      if (errorMessage.includes('model') || errorMessage.includes('API')) {
        return Response.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
      }
    }

    // For other errors, return a generic message
    return Response.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}