import { useThemeColor } from '@/hooks/useThemeColor';
import { generateAPIUrl } from '@/utils/utils';
import { useCompletion } from '@ai-sdk/react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Page = () => {
  const [message, setMessage] = useState('Generate a ghibli-style image of a cat');
  const tabBarHeight = useBottomTabBarHeight();

  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  const {
    completion,
    complete,
    isLoading,
    error
  } = useCompletion({
    api: generateAPIUrl('/api/generate-image'),
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
          Generate Image
        </Text>

        {/* Input area */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-3">
            <TextInput
              className="text-base min-h-[40px]"
              style={{ color: textColor }}
              placeholder="Describe the image you want..."
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
              {isLoading ? "Loading..." : "Generate"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image display */}
        <ScrollView
          className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-4"
          contentContainerStyle={{ paddingBottom: 8 + tabBarHeight / 2 }}
        >
          {!completion && !isLoading && (
            <Text className="text-center mt-5 text-gray-500 dark:text-gray-400">
              Describe an image to generate
            </Text>
          )}

          {completion && (
            <View className="items-center">
              <Image
                source={{ uri: completion }}
                className="w-full aspect-square rounded-lg"
                style={{ resizeMode: 'contain' }}
              />
            </View>
          )}

          {isLoading && (
            <View className="items-center p-3">
              <ActivityIndicator color={textColor} />
              <Text className="mt-2 text-gray-500 dark:text-gray-400">
                Generating your image...
              </Text>
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
