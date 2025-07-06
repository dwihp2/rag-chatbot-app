import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { chunks, documents } from '../db/schema';

// Configuration
const EMBEDDING_MODEL = 'text-embedding-3-small'; // Cheapest OpenAI embedding model
const CHUNK_SIZE = 1000;

// Types
interface ChunkWithEmbedding {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: any;
  createdAt: Date;
}

interface SearchResult {
  chunk: ChunkWithEmbedding;
  score: number;
  source: 'embedding';
}

// Global variables for retrieval systems
let embeddingChunks: ChunkWithEmbedding[] = [];
let isInitialized = false;

// Utility functions
function chunkText(text: string, maxChunkSize: number = CHUNK_SIZE): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + ' ';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Generate embedding for text
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a fallback empty embedding instead of throwing
    return new Array(1536).fill(0); // OpenAI ada-002 embedding size
  }
}

// Add a document with embeddings
export async function addDocumentWithEmbeddings(
  title: string,
  content: string,
  metadata: any = {}
): Promise<string> {
  const documentId = nanoid();

  try {
    // Insert the document
    await db.insert(documents).values({
      id: documentId,
      title,
      content,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Chunk the document
    const textChunks = chunkText(content);
    const newChunks: ChunkWithEmbedding[] = [];

    // Process each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunkId = nanoid();
      const chunkContent = textChunks[i];

      // Generate embedding for the chunk
      const embedding = await generateEmbedding(chunkContent);

      // Store chunk with embedding in database
      await db.insert(chunks).values({
        id: chunkId,
        documentId,
        content: chunkContent,
        embedding: embedding,
        metadata: {
          ...metadata,
          index: i,
        },
        createdAt: new Date(),
      });

      // Add to local cache
      const chunkWithEmbedding: ChunkWithEmbedding = {
        id: chunkId,
        documentId,
        content: chunkContent,
        embedding,
        metadata: { ...metadata, index: i },
        createdAt: new Date(),
      };

      newChunks.push(chunkWithEmbedding);
    }

    // Update global state
    embeddingChunks.push(...newChunks);

    console.log(`✅ Added document "${title}" with ${textChunks.length} chunks and embeddings`);
    return documentId;
  } catch (error) {
    console.error('Error adding document with embeddings:', error);
    throw error;
  }
}

// Embedding-based search
async function searchByEmbedding(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    if (embeddingChunks.length === 0) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);
    const results: SearchResult[] = [];

    for (const chunk of embeddingChunks) {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({
        chunk,
        score: similarity,
        source: 'embedding'
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in embedding search:', error);
    return [];
  }
}

// Main search function - embedding-only
export async function embeddingSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    const results = await searchByEmbedding(query, limit);

    console.log(`🔍 Embedding Search Results:`, {
      query,
      totalResults: results.length,
      scores: results.map(r => ({ id: r.chunk.id, score: r.score.toFixed(4) }))
    });

    return results;
  } catch (error) {
    console.error('Error in embedding search:', error);
    return [];
  }
}

// Initialize the enhanced RAG system
export async function initializeEnhancedRAG(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    console.log('🚀 Initializing Enhanced RAG System (Embedding-Only)...');

    // Load existing chunks from database
    const existingChunks = await db.select().from(chunks);

    embeddingChunks = existingChunks
      .filter(chunk => chunk.embedding) // Only chunks with embeddings
      .map(chunk => ({
        id: chunk.id,
        documentId: chunk.documentId,
        content: chunk.content,
        embedding: chunk.embedding as number[],
        metadata: chunk.metadata,
        createdAt: chunk.createdAt!,
      }));

    console.log(`📊 Loaded ${embeddingChunks.length} chunks with embeddings`);

    isInitialized = true;
    console.log('✅ Enhanced RAG System (Embedding-Only) initialized successfully');
  } catch (error) {
    console.error('Error initializing enhanced RAG system:', error);
    // Don't throw error - just log it and continue with empty state
    embeddingChunks = [];
    isInitialized = true;
    console.log('⚠️ Enhanced RAG System initialized with empty state due to error');
  }
}

// Get all documents
export async function getAllDocuments(): Promise<any[]> {
  return db.select().from(documents).orderBy(documents.createdAt);
}

// Delete a document and its chunks
export async function deleteDocument(documentId: string): Promise<void> {
  // Remove from local cache
  embeddingChunks = embeddingChunks.filter(chunk => chunk.documentId !== documentId);

  // Delete from database (cascade delete will remove chunks)
  await db.delete(documents).where(eq(documents.id, documentId));

  console.log(`🗑️ Deleted document ${documentId} and updated embedding cache`);
}

// Delete all documents (for testing/reset)
export async function deleteAllDocuments(): Promise<void> {
  embeddingChunks = [];

  await db.delete(documents);

  console.log('🗑️ Deleted all documents and reset embedding cache');
}
