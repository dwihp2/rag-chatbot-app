import { addDocumentWithEmbeddings, deleteDocument, getAllDocuments } from '@/lib/services/enhanced-rag-service';

// GET /api/documents - Get all documents
export async function GET() {
  try {
    const documents = await getAllDocuments();
    return Response.json({ documents });
  } catch (error) {
    // Expected error when refreshing knowledge base - suppress error display
    console.warn('Expected error when refreshing knowledge base:', error);
    return Response.json({ documents: [] }); // Return empty array instead of error
  }
}

// POST /api/documents - Upload a new document
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    console.log('📄 Processing new document:', { title, contentLength: content.length });

    // Add document with embeddings and process it (chunking + indexing + embedding)
    const documentId = await addDocumentWithEmbeddings(title.trim(), content.trim());

    // Get the created document to return
    const documents = await getAllDocuments();
    const document = documents.find(doc => doc.id === documentId);

    console.log('✅ Document processed successfully:', { documentId, title });

    return Response.json({
      document,
      message: 'Document uploaded and processed with embeddings successfully'
    });
  } catch (error) {
    // Expected error during document processing - log but handle gracefully
    console.warn('Expected error during document processing:', error);
    return Response.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}

// DELETE /api/documents - Delete a document
export async function DELETE(request: Request) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return Response.json({ error: 'Document ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting document:', documentId);
    await deleteDocument(documentId);

    console.log('✅ Document deleted successfully:', documentId);
    return Response.json({ success: true });
  } catch (error) {
    // Expected error during document deletion - log but handle gracefully
    console.warn('Expected error during document deletion:', error);
    return Response.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
