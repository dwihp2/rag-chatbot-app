import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function WelcomePage() {
  const tabBarHeight = useBottomTabBarHeight();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const features = [
    {
      icon: 'chatbubble-ellipses',
      title: 'Smart Conversations',
      description: 'Chat with an AI assistant that remembers your conversation history and provides contextual responses.',
      action: () => router.push('/ask'),
      actionText: 'Start Chatting'
    },
    {
      icon: 'library-outline',
      title: 'Knowledge Base',
      description: 'Upload documents to enhance the AI&apos;s knowledge. Your documents are processed and used to provide more accurate answers.',
      action: () => router.push('/rag-upload'),
      actionText: 'Upload Documents'
    },
    {
      icon: 'search-outline',
      title: 'Intelligent Search',
      description: 'Advanced BM25 search algorithm finds the most relevant information from your uploaded documents.',
      action: () => router.push('/ask'),
      actionText: 'Try It Now'
    }
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          className="items-center px-6 pt-12 pb-8"
        >
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
            <Ionicons name="bulb" size={36} color="white" />
          </View>

          <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome to RAG Chat
          </Text>

          <Text className={`text-lg text-center leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            An intelligent chatbot powered by Retrieval-Augmented Generation technology
          </Text>
        </Animated.View>

        {/* Features Section */}
        <View className="px-6">
          <Animated.Text
            entering={FadeInUp.delay(400).duration(600)}
            className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            What can you do?
          </Animated.Text>

          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInUp.delay(600 + index * 150).duration(600)}
              className={`mb-6 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={isDark ? 'white' : '#6366f1'}
                  />
                </View>
                <Text className={`text-lg font-semibold flex-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </Text>
              </View>

              <Text className={`text-base leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
              </Text>

              <TouchableOpacity
                onPress={feature.action}
                className={`py-3 px-6 rounded-xl ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}
              >
                <Text className="text-white font-medium text-center">
                  {feature.actionText}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Getting Started Section */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(600)}
          className="px-6 mt-4"
        >
          <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-indigo-50 border border-indigo-200'}`}>
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-indigo-900'}`}>
              🚀 Getting Started
            </Text>

            <View className="space-y-2">
              <View className="flex-row items-center mb-2">
                <Text className={`text-base mr-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>1.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-indigo-800'}`}>
                  Upload documents to build your knowledge base
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Text className={`text-base mr-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>2.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-indigo-800'}`}>
                  Start a conversation in the chat tab
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className={`text-base mr-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>3.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-indigo-800'}`}>
                  Ask questions related to your uploaded content
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}