import { addDocument, deleteDocument, getAllDocuments } from '@/lib/services/rag-service';

// GET /api/documents - Get all documents
export async function GET() {
  try {
    const documents = await getAllDocuments();
    return Response.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Upload a new document
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Add document and process it (chunking + indexing)
    const documentId = await addDocument(title.trim(), content.trim());

    // Get the created document to return
    const documents = await getAllDocuments();
    const document = documents.find(doc => doc.id === documentId);

    return Response.json({
      document,
      message: 'Document uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
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

    await deleteDocument(documentId);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return Response.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
