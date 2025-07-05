import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { chunks, documents } from '../db/schema';

// Simple BM25 implementation
class BM25 {
  private documents: { id: string; content: string; tokens: string[] }[] = [];
  private k1: number = 1.2;
  private b: number = 0.75;
  private avgDocLength: number = 0;
  private idf: Map<string, number> = new Map();

  // Add document to the index
  addDocument(id: string, content: string) {
    const tokens = this.tokenize(content);
    this.documents.push({ id, content, tokens });
    this.updateStatistics();
  }

  // Remove document from the index
  removeDocument(id: string) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    this.updateStatistics();
  }

  // Tokenize text into words
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  // Update IDF scores and average document length
  private updateStatistics() {
    if (this.documents.length === 0) return;

    // Calculate average document length
    const totalLength = this.documents.reduce((sum, doc) => sum + doc.tokens.length, 0);
    this.avgDocLength = totalLength / this.documents.length;

    // Calculate IDF for each term
    this.idf.clear();
    const termDocCount = new Map<string, number>();

    // Count documents containing each term
    this.documents.forEach(doc => {
      const uniqueTerms = new Set(doc.tokens);
      uniqueTerms.forEach(term => {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1);
      });
    });

    // Calculate IDF scores
    const N = this.documents.length;
    termDocCount.forEach((df, term) => {
      this.idf.set(term, Math.log((N - df + 0.5) / (df + 0.5)));
    });
  }

  // Search for relevant documents
  search(query: string, limit: number = 5): { id: string; score: number }[] {
    if (this.documents.length === 0) return [];

    const queryTokens = this.tokenize(query);
    const scores = new Map<string, number>();

    this.documents.forEach(doc => {
      let score = 0;
      const docTokenCount = new Map<string, number>();

      // Count term frequency in document
      doc.tokens.forEach(token => {
        docTokenCount.set(token, (docTokenCount.get(token) || 0) + 1);
      });

      // Calculate BM25 score
      queryTokens.forEach(queryToken => {
        const tf = docTokenCount.get(queryToken) || 0;
        const idf = this.idf.get(queryToken) || 0;
        const docLength = doc.tokens.length;

        if (tf > 0) {
          const tfComponent = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength)));
          score += idf * tfComponent;
        }
      });

      if (score > 0) {
        scores.set(doc.id, score);
      }
    });

    // Sort by score and return top results with scores
    return Array.from(scores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id, score]) => ({ id, score }));
  }

  // Get all document IDs
  getAllDocumentIds(): string[] {
    return this.documents.map(doc => doc.id);
  }
}

// Create BM25 index for document search
const documentIndex = new BM25();
let isIndexInitialized = false;

// Function to chunk text into smaller segments
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  // Split the text into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence would exceed the max chunk size,
    // save the current chunk and start a new one
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }

    currentChunk += sentence + ' ';
  }

  // Add the last chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Add a document and chunk it
export async function addDocument(title: string, content: string, metadata: any = {}): Promise<string> {
  const documentId = nanoid();

  // Insert the document
  await db.insert(documents).values({
    id: documentId,
    title,
    content,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Chunk the document and store chunks
  const textChunks = chunkText(content);

  for (let i = 0; i < textChunks.length; i++) {
    const chunkId = nanoid();
    const chunkContent = textChunks[i];

    await db.insert(chunks).values({
      id: chunkId,
      documentId,
      content: chunkContent,
      metadata: {
        ...metadata,
        index: i,
      },
      createdAt: new Date(),
    });

    // Add to BM25 search index
    documentIndex.addDocument(chunkId, chunkContent);
  }

  return documentId;
}

// Search for relevant document chunks
export async function searchDocuments(query: string, limit: number = 5): Promise<any[]> {
  // Search the BM25 index for relevant chunk IDs with scores
  const results = documentIndex.search(query, limit);

  if (!results || results.length === 0) {
    return [];
  }

  // Get the actual chunks with their scores
  const relevantChunks = await Promise.all(
    results.map(async (result) => {
      const chunkResult = await db
        .select()
        .from(chunks)
        .where(eq(chunks.id, result.id));

      if (chunkResult.length === 0) return null;

      // Return chunk with score
      return {
        ...chunkResult[0],
        score: result.score
      };
    })
  );

  return relevantChunks.filter(Boolean);
}

// Get all documents
export async function getAllDocuments(): Promise<any[]> {
  return db.select().from(documents).orderBy(documents.createdAt);
}

// Delete a document and its chunks
export async function deleteDocument(documentId: string): Promise<void> {
  // Get all chunks for this document first
  const documentChunks = await db
    .select()
    .from(chunks)
    .where(eq(chunks.documentId, documentId));

  // Remove chunks from BM25 index
  documentChunks.forEach(chunk => {
    documentIndex.removeDocument(chunk.id);
  });

  // Delete the document (cascade delete will remove all chunks)
  await db.delete(documents).where(eq(documents.id, documentId));
}

// When the app starts, load existing documents into the search index
export async function initializeSearchIndex(): Promise<void> {
  if (isIndexInitialized) {
    return; // Already initialized
  }

  const allChunks = await db.select().from(chunks);

  for (const chunk of allChunks) {
    documentIndex.addDocument(chunk.id, chunk.content);
  }

  isIndexInitialized = true;
  console.log(`Initialized BM25 index with ${allChunks.length} chunks`);
}
