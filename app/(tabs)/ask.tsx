import { useThemeColor } from '@/hooks/useThemeColor';
import { generateAPIUrl } from '@/utils/utils';
import { useCompletion } from '@ai-sdk/react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Page = () => {
  const [message, setMessage] = useState('How to make a pie?');
  const tabBarHeight = useBottomTabBarHeight();

  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  const {
    completion,
    complete,
    isLoading,
    error
  } = useCompletion({
    api: generateAPIUrl('/api/completion'),
    streamProtocol: 'text',
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onError: (err) => {
      console.error(err);
    }
  });

  const onSubmit = async () => {
    if (!message.trim()) return;
    complete(message);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 p-4" style={{ paddingBottom: 8 + tabBarHeight }}>
        <Text className="text-2xl font-bold mb-4" style={{ color: textColor }}>
          Ask Anything
        </Text>

        {/* Input area */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-3">
            <TextInput
              className="text-base min-h-[40px]"
              style={{ color: textColor }}
              placeholder="Enter your question here..."
              placeholderTextColor={textColor + '80'}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
          <TouchableOpacity
            className="ml-2 p-3 rounded-xl bg-blue-500 items-center justify-center"
            onPress={onSubmit}
            disabled={isLoading || !message.trim()}
            style={{ opacity: (isLoading || !message.trim()) ? 0.5 : 1 }}
          >
            <Text className="text-white font-medium">
              {isLoading ? "Loading..." : "Send"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Messages display */}
        <ScrollView
          className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-4"
          contentContainerStyle={{ paddingBottom: 8 + tabBarHeight / 2 }}
        >
          {!completion && !isLoading && (
            <Text className="text-center mt-5 text-gray-500 dark:text-gray-400">
              Ask a question to get a response
            </Text>
          )}

          {completion && (
            <Text className="text-base leading-6" style={{ color: textColor }}>
              {completion}
            </Text>
          )}

          {isLoading && (
            <View className="items-center p-3">
              <ActivityIndicator color={textColor} />
            </View>
          )}
        </ScrollView>

        {error && (
          <View className="p-3 bg-red-500 rounded-lg mb-4">
            <Text className="text-white">{error instanceof Error ? error.message : String(error)}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Page;