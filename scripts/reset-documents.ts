import { deleteAllDocuments } from '../lib/services/enhanced-rag-service';

async function resetDocuments() {
  try {
    console.log('🗑️ Deleting all documents from database...');
    await deleteAllDocuments();
    console.log('✅ All documents deleted successfully!');
    console.log('📝 You can now upload documents with the new embedding-based system.');
  } catch (error) {
    console.error('❌ Error deleting documents:', error);
    process.exit(1);
  }
}

// Run the reset if this script is called directly
if (require.main === module) {
  resetDocuments();
}

export { resetDocuments };
