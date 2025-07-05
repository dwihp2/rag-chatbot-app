import { initializeSearchIndex, searchDocuments } from './rag-service';

/**
 * RAG Helper Utilities for Development Experience
 * 
 * This module provides convenient functions for working with the RAG system
 * during development and testing.
 */

// Initialize the RAG system
export async function initRAG(): Promise<void> {
  try {
    await initializeSearchIndex();
    console.log('✅ RAG system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize RAG system:', error);
    throw error;
  }
}

// Test RAG search functionality
export async function testRAGSearch(query: string, limit: number = 5): Promise<void> {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    const results = await searchDocuments(query, limit);

    if (results.length === 0) {
      console.log('📭 No relevant documents found');
      return;
    }

    console.log(`📚 Found ${results.length} relevant chunks:`);
    results.forEach((chunk, index) => {
      console.log(`\n${index + 1}. Chunk ID: ${chunk.id}`);
      console.log(`   Content: ${chunk.content.substring(0, 100)}...`);
      console.log(`   Created: ${chunk.createdAt}`);
    });
  } catch (error) {
    console.error('❌ RAG search test failed:', error);
    throw error;
  }
}

// Enhanced search with context building for chat
export async function searchWithContext(query: string, limit: number = 3): Promise<string> {
  try {
    const relevantChunks = await searchDocuments(query, limit);

    if (relevantChunks.length === 0) {
      return '';
    }

    const contextPrompt = `

Based on the following knowledge from the database, please provide an accurate and helpful response:

${relevantChunks.map((chunk, index) => `
Knowledge ${index + 1}:
${chunk.content}
`).join('\n')}

If the knowledge above is relevant to the user's question, use it to provide a comprehensive answer. If the knowledge is not relevant, respond normally based on your general knowledge.

`;

    return contextPrompt;
  } catch (error) {
    console.error('❌ Failed to build RAG context:', error);
    return '';
  }
}

// Debug function to check RAG system status
export async function debugRAGStatus(): Promise<void> {
  try {
    console.log('🔧 RAG System Debug Information:');

    // You can add more debug information here as needed
    console.log('✅ RAG service imported successfully');
    console.log('✅ Search functions available');

    // Test basic search
    await testRAGSearch('test', 1);

  } catch (error) {
    console.error('❌ RAG system debug failed:', error);
  }
}

// Export for easy access in development
export const RAGTools = {
  init: initRAG,
  search: testRAGSearch,
  searchWithContext,
  debug: debugRAGStatus,
};
