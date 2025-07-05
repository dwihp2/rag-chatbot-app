import { useColorScheme } from '@/hooks/useColorScheme';
import { generateAPIUrl } from '@/utils/utils';
import { useChat } from '@ai-sdk/react';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { fetch as expoFetch } from 'expo/fetch';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function App() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { messages, error, handleInputChange, input, handleSubmit, isLoading } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: error => console.error(error, 'ERROR'),
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (error) return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-500 font-bold text-lg">Error: {error.message}</Text>
    </View>
  );

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e: any) => {
    handleSubmit(e);
    e.preventDefault();
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={tabBarHeight + 10}
      >
        <View className="flex-1 px-4">
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Animated.View entering={FadeInDown.delay(300).duration(700)} className="items-center">
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                  <Ionicons name="chatbubble-ellipses" size={28} color="white" />
                </View>
                <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Welcome to RAG Chat</Text>
                <Text className={`text-center text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Start a conversation with the AI assistant
                </Text>
              </Animated.View>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => (
                <Animated.View
                  key={message.id}
                  entering={FadeInUp.delay(index * 100).duration(500)}
                  className={`flex mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <View
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                      : isDark ? 'bg-gray-800' : 'bg-white'
                      } ${message.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                  >
                    <Text
                      className={`${message.role === 'user' ? 'text-white' : isDark ? 'text-gray-200' : 'text-gray-800'} text-base`}
                    >
                      {message.content}
                    </Text>
                    <Text
                      className={`text-xs mt-1 text-right ${message.role === 'user' ? 'text-indigo-200' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {formatTime()}
                    </Text>
                  </View>
                </Animated.View>
              ))}

              {isLoading && (
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  className="flex items-start mb-4"
                >
                  <View className={`rounded-2xl rounded-tl-none px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <ActivityIndicator size="small" color={isDark ? '#a5b4fc' : '#6366f1'} />
                  </View>
                </Animated.View>
              )}
            </ScrollView>
          )}

          <View
            className={`flex-row items-center border rounded-full mb-2 px-4 ${isDark
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-300 bg-white'
              }`}
            style={{ marginBottom: tabBarHeight + 10 }}
          >
            <TextInput
              className={`flex-1 py-3 px-2 text-base ${isDark ? 'text-white' : 'text-gray-800'}`}
              placeholder="Type a message..."
              placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
              value={input}
              onChange={e =>
                handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    value: e.nativeEvent.text,
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>)
              }
              onSubmitEditing={handleSendMessage}
              autoFocus={false}
              multiline
              style={{ maxHeight: 100 }}
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={`rounded-full p-2 ${!input.trim() || isLoading
                ? isDark ? 'bg-gray-700' : 'bg-gray-200'
                : isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={!input.trim() || isLoading ? '#9ca3af' : 'white'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}