# RAG Chatbot App 🤖

A mobile application built with [Expo](https://expo.dev) and React Native that integrates AI-powered features including:
- Interactive chat with AI (RAG-enhanced)
- Text completion
- AI image generation

## Project Overview

This application demonstrates how to build a modern AI-powered mobile experience using:
- Expo & React Native for cross-platform mobile development
- AI SDK for seamless AI integration
- NativeWind for styling
- Expo Router for navigation

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
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

The app consists of three main tabs:
1. **Chat Tab** (`app/(tabs)/index.tsx`): Full conversation interface with the AI assistant
2. **Ask Tab** (`app/(tabs)/ask.tsx`): Quick Q&A with the AI without conversation history
3. **Images Tab** (`app/(tabs)/images.tsx`): Generate AI images from text descriptions

## API Integration

The application connects to several API endpoints:
- `/api/chat`: For conversational AI interactions
- `/api/completion`: For single-prompt text completions
- `/api/generate-image`: For AI image generation

## Project Flow

1. **User Journey**:
   - Users can switch between chat, ask, and image generation tabs
   - In the chat tab, users can have ongoing conversations with the AI assistant
   - The ask tab provides quick answers to one-off questions
   - The images tab allows users to generate AI images from text descriptions

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
