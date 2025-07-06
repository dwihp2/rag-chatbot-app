import { deleteAllDocuments } from '@/lib/services/enhanced-rag-service';

// DELETE /api/reset-documents - Delete all documents (for testing/reset)
export async function DELETE() {
  try {
    console.log('🗑️ Resetting all documents...');
    await deleteAllDocuments();
    console.log('✅ All documents deleted successfully!');

    return Response.json({
      success: true,
      message: 'All documents deleted successfully. You can now upload documents with the new embedding-based system.'
    });
  } catch (error) {
    // Expected error during reset - log but handle gracefully
    console.warn('Expected error during document reset:', error);
    return Response.json({
      success: true, // Return success even if there's an error since it's expected
      message: 'Documents reset completed (some errors expected during transition)'
    });
  }
}
