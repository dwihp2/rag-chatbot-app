#!/usr/bin/env tsx
import { resetDocuments } from './reset-documents';

async function setupCulinaryRAG() {
  console.log('🍳 Setting up Culinary RAG Assistant...\n');

  try {
    console.log('1. Resetting knowledge base...');
    await resetDocuments();

    console.log('\n✅ Culinary RAG Assistant setup complete!');
    console.log('\n🎉 Your chatbot is now specialized for cooking and baking assistance.');
    console.log('\n📚 Next steps:');
    console.log('   1. Upload cookbooks, recipes, or cooking guides via the RAG Upload tab');
    console.log('   2. Start asking cooking and baking questions in the Chat tab');
    console.log('   3. Try asking about specific recipes, techniques, or ingredients');
    console.log('\n💡 Example questions to try:');
    console.log('   - "How do I make sourdough bread?"');
    console.log('   - "What can I substitute for eggs in baking?"');
    console.log('   - "How do I properly caramelize onions?"');
    console.log('   - "What temperature should I cook chicken to?"');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n📋 Manual setup required:');
    console.log('   1. Ensure your .env.local file is properly configured');
    console.log('   2. Run: npm run db:migrate');
    console.log('   3. Run: npm run reset-documents');
    console.log('   4. Start uploading your recipe collections!');
  }
}

// Run setup if this script is called directly
if (require.main === module) {
  setupCulinaryRAG();
}

export { setupCulinaryRAG };
