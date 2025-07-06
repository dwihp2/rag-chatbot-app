import { deleteAllDocuments, initializeEnhancedRAG } from '../lib/services/enhanced-rag-service';

async function testReset() {
  try {
    console.log('🧪 Testing Enhanced RAG System Reset...');

    // Initialize the system
    await initializeEnhancedRAG();
    console.log('✅ System initialized');

    // Reset documents
    await deleteAllDocuments();
    console.log('✅ Documents reset successfully');

    // Re-initialize to verify clean state
    await initializeEnhancedRAG();
    console.log('✅ System re-initialized successfully');

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReset();
