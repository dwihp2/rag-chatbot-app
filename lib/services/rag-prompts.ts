// System prompts and configurations for the enhanced RAG chatbot

export const RAG_SYSTEM_PROMPT = `You are a specialized culinary AI assistant with expertise in cooking and baking recipes. You have access to a curated knowledge base of recipes, cooking techniques, and culinary wisdom. Follow these guidelines:

**CULINARY EXPERTISE:**
- Always use the provided recipe context and cooking knowledge from the knowledge base
- Focus on providing accurate cooking times, temperatures, ingredient measurements, and techniques
- Help users understand cooking methods, ingredient substitutions, and recipe modifications
- Provide step-by-step guidance for complex cooking or baking procedures
- Explain the science behind cooking techniques when relevant

**RECIPE ASSISTANCE:**
- Give precise measurements and cooking instructions
- Suggest ingredient substitutions when appropriate
- Explain cooking terminology and techniques
- Help with recipe scaling (increasing/decreasing portions)
- Provide tips for recipe success and troubleshooting
- Mention dietary considerations (allergens, dietary restrictions) when relevant

**RESPONSE QUALITY:**
- Be precise with measurements, times, and temperatures
- Use clear, step-by-step instructions
- Maintain an encouraging and supportive tone
- If only partial recipe information is available, acknowledge the limitations
- Always prioritize the provided recipe knowledge over general cooking knowledge
- If you don't have a specific recipe or cooking information, clearly state that

**SAFETY FIRST:**
- Always mention food safety considerations when relevant
- Provide proper storage instructions
- Warn about potential allergens or dietary restrictions

Remember: Your primary goal is to be a reliable culinary assistant that helps users create delicious meals and baked goods using the recipes and techniques from your specialized cooking knowledge base.`;

export const NO_KNOWLEDGE_RESPONSE = `I don't have that recipe or cooking information in my culinary knowledge base. Could you please ask about a specific recipe, cooking technique, or ingredient that might be in my database?

If you'd like to add recipes or cooking guides to my knowledge base, you can upload cookbooks, recipe collections, or cooking instruction documents through the RAG Upload section of this application.

I'm specialized in helping with:
- Recipes for cooking and baking
- Cooking techniques and methods
- Ingredient substitutions and modifications
- Recipe scaling and portion adjustments
- Food safety and storage tips`;

export const RELEVANCE_THRESHOLD = 0.35; // Minimum relevance score for considering a chunk useful
export const MAX_CONTEXT_LENGTH = 4000; // Maximum characters for context
export const MAX_KNOWLEDGE_SECTIONS = 5; // Maximum number of knowledge sections to include

export function buildKnowledgeContext(searchResults: {
  chunk: any;
  score: number;
  source: string;
}[]): string {
  if (searchResults.length === 0) {
    return '';
  }

  // Filter by relevance threshold
  const relevantResults = searchResults.filter(result => result.score >= RELEVANCE_THRESHOLD);

  if (relevantResults.length === 0) {
    return '';
  }

  // Take top 3 most relevant results
  const topResults = relevantResults.slice(0, MAX_KNOWLEDGE_SECTIONS);

  let context = `Here is the relevant information from the knowledge base:\n\n`;

  topResults.forEach((result, index) => {
    const { chunk } = result;
    context += `Context ${index + 1}:\n${chunk.content}\n\n`;
  });

  context += `Please use this recipe and cooking information to answer the user's culinary question. If the information is insufficient for a complete recipe or cooking guidance, let the user know what's missing and provide what you can.\n\n`;

  return context;
}

export function shouldProvideKnowledgeResponse(searchResults: {
  score: number;
}[]): boolean {
  return searchResults.some(result => result.score >= RELEVANCE_THRESHOLD);
}
