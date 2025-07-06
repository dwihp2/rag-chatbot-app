# RAG Chatbot App - Culinary Assistant 🍳👨‍🍳

A mobile application built with [Expo](https://expo.dev) and React Native that integrates AI-powered features specialized for cooking and baking:
- Interactive chat with AI culinary assistant (RAG-enhanced with recipe knowledge)
- Recipe recommendations and cooking guidance
- AI image generation for food visualization
- Upload and search through cookbooks and recipe collections

## Project Overview

This application demonstrates how to build a modern AI-powered culinary assistant using:
- Expo & React Native for cross-platform mobile development
- AI SDK for seamless AI integration with cooking-specialized prompts
- RAG (Retrieval-Augmented Generation) for recipe and cooking technique knowledge
- NativeWind for styling
- Expo Router for navigation
- Supabase for database and document storage

## Getting Started

### Prerequisites
1. **Database Setup**: This app requires a Supabase database for storing recipes and chat history
2. **OpenAI API Key**: For AI-powered cooking assistance

### Environment Setup
1. Copy the environment template:
   ```bash
   cp .env.local.template .env.local
   ```

2. Fill in your environment variables in `.env.local`:
   - Get Supabase credentials from [supabase.com](https://supabase.com)
   - Get OpenAI API key from [platform.openai.com](https://platform.openai.com)

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up database tables:
   ```bash
   npm run db:migrate
   ```

3. Set up the culinary RAG system:
   ```bash
   npm run setup-culinary-rag
   ```

4. Start the app

   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - iOS: Press `i` in terminal or use `npm run ios`
   - Android: Press `a` in terminal or use `npm run android`
   - Web: Press `w` in terminal or use `npm run web`
   - Expo Go: Scan QR code with the Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Quick Start with QR Code

Scan this QR code with your Expo Go app to open the project:

![Expo QR Code](https://qr.expo.dev/expo-go?owner=dwihp2&slug=rag-chatbot-app&releaseChannel=default&host=exp.host)

> **Note**: This QR code links to the deployed version of this application on Expo's servers.
>
> You can also access the project directly in Expo Go by searching for "@dwihp2/rag-chatbot-app" or by visiting the [project page](https://expo.dev/@dwihp2/rag-chatbot-app) on Expo's website.

## Application Structure

The app consists of four main tabs:
1. **Home Tab** (`app/(tabs)/index.tsx`): Welcome page with app introduction and navigation
2. **Chat Tab** (`app/(tabs)/ask.tsx`): Interactive chat interface with the culinary AI assistant featuring full conversation history
3. **Images Tab** (`app/(tabs)/images.tsx`): Generate AI images of dishes and food
4. **Recipes Tab** (`app/(tabs)/rag-upload.tsx`): Upload cookbooks, recipes, and cooking guides to expand the knowledge base

## Culinary Features

### Recipe Knowledge Base
- Upload cookbooks, recipe collections, and cooking guides
- AI-powered search through your recipe collection
- Smart ingredient substitution suggestions
- Recipe scaling and portion adjustments

### Cooking Assistance
- Step-by-step cooking guidance
- Cooking technique explanations
- Temperature and timing recommendations
- Food safety tips and storage advice

### Specialized Prompts
- Focused on cooking and baking expertise
- Recipe-specific response formatting
- Ingredient-focused search capabilities
- Cooking terminology and technique explanations

## API Integration

The application connects to several API endpoints:
- `/api/chat`: For conversational AI interactions
- `/api/completion`: For single-prompt text completions
- `/api/generate-image`: For AI image generation

## Project Flow

1. **User Journey**:
   - Users start on the Home tab with app introduction and navigation
   - In the Chat tab, users can have ongoing conversations with the AI culinary assistant
   - The Images tab allows users to generate AI images of dishes and food from text descriptions
   - The Recipes tab enables users to upload cookbooks and expand the knowledge base

2. **Technical Flow**:
   - User inputs are processed through the UI
   - Requests are sent to the appropriate API endpoints
   - Responses are streamed back and displayed in the UI
   - Dark/light mode is supported throughout the app

## Development

### Key Technologies
- **React Native**: Core framework for mobile development
- **Expo**: Development platform for React Native
- **Expo Router**: File-based routing system
- **AI SDK**: Integration with AI APIs
- **NativeWind/Tailwind**: For styling
- **React Native Reanimated**: For smooth animations

### Folder Structure
- `/app`: Main application code with file-based routing
  - `/(tabs)`: Tab-based navigation screens
  - `/api`: API endpoints for AI services
- `/components`: Reusable UI components
- `/hooks`: Custom React hooks
- `/utils`: Utility functions

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [AI SDK Documentation](https://ai.vercel.ai/docs)

## Testing Your Setup

After completing the setup, you can test the database connection:

```bash
# Test database connection
npm run test-db

# Check that the culinary system is working
npm run setup-culinary-rag
```

If you encounter any issues, check that:
1. Your `.env.local` file has all required variables
2. Your Supabase database is accessible
3. Your OpenAI API key is valid

### Testing with Sample Content

To test your culinary RAG system, you can upload the provided sample cookbook:

1. Open the app and go to the "Recipes" tab
2. Upload the `sample-cookbook.md` file (included in the project root)
3. Try asking questions like:
   - "How do I make chocolate chip cookies?"
   - "What temperature should I cook chicken to?"
   - "How do I substitute eggs in baking?"
   - "How long does it take to caramelize onions?"

The sample cookbook includes basic recipes, cooking techniques, food safety guidelines, and ingredient substitutions to demonstrate the system's capabilities.
