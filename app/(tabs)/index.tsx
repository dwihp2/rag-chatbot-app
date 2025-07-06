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
      title: 'Culinary Assistant',
      description: 'Chat with your personal AI chef that knows your recipes and cooking techniques. Get step-by-step guidance and cooking tips.',
      action: () => router.push('/ask'),
      actionText: 'Start Cooking Chat'
    },
    {
      icon: 'library-outline',
      title: 'Recipe Collection',
      description: 'Upload your cookbooks, recipes, and cooking guides. The AI learns from your collection to provide personalized cooking advice.',
      action: () => router.push('/rag-upload'),
      actionText: 'Upload Recipes'
    },
    {
      icon: 'search-outline',
      title: 'Recipe Search',
      description: 'Advanced search through your recipe collection. Find ingredients, techniques, and cooking methods instantly.',
      action: () => router.push('/ask'),
      actionText: 'Search Recipes'
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
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? 'bg-orange-600' : 'bg-orange-500'}`}>
            <Ionicons name="restaurant" size={36} color="white" />
          </View>

          <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Culinary AI Assistant
          </Text>

          <Text className={`text-lg text-center leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your personal AI chef powered by your recipe collection and cooking knowledge
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
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-orange-600' : 'bg-orange-100'}`}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={isDark ? 'white' : '#ea580c'}
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
                className={`py-3 px-6 rounded-xl ${isDark ? 'bg-orange-600' : 'bg-orange-500'}`}
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
          <View className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-orange-50 border border-orange-200'}`}>
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-orange-900'}`}>
              🍳 Getting Started
            </Text>

            <View className="space-y-2">
              <View className="flex-row items-center mb-2">
                <Text className={`text-base mr-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>1.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-orange-800'}`}>
                  Upload your cookbooks, recipes, and cooking guides
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <Text className={`text-base mr-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>2.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-orange-800'}`}>
                  Start cooking conversations in the chat tab
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className={`text-base mr-3 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>3.</Text>
                <Text className={`text-base flex-1 ${isDark ? 'text-gray-300' : 'text-orange-800'}`}>
                  Ask about recipes, techniques, and cooking tips
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}