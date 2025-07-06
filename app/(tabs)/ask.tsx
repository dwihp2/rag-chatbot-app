import { useThemeColor } from '@/hooks/useThemeColor';
import { generateAPIUrl } from '@/utils/utils';
import { useChat } from '@ai-sdk/react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const router = useRouter();

  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  // Load chat history
  const loadChatHistory = async () => {
    setLoadingChats(true);
    try {
      const response = await fetch(generateAPIUrl('/api/chats'));
      const data = await response.json();
      if (data.chats) {
        setChatHistory(data.chats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages
  } = useChat({
    api: generateAPIUrl('/api/chat'),
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    body: {
      chatId: currentChatId
    },
    onResponse: (response) => {
      // Extract chatId from response headers
      const chatId = response.headers.get('X-Chat-Id');
      if (chatId && !currentChatId) {
        setCurrentChatId(chatId);
        // Reload chat history to include the new chat
        loadChatHistory();
      }
    },
    onError: (err) => {
      console.error('Chat error:', err);
      // Don't show errors for expected "no knowledge found" scenarios
      if (err.message &&
        (err.message.includes('No relevant knowledge found') ||
          err.message.includes("don't have information") ||
          err.message.includes("specialized in helping"))) {
        // This is handled by the API's fallback response, so we don't need to show an error
        return;
      }
    }
  });

  // Auto-scroll to bottom when messages change or when loading
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Additional scroll effect for real-time streaming during loading
  useEffect(() => {
    if (isLoading && messages.length > 0) {
      const interval = setInterval(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 200); // Scroll every 200ms during streaming

      return () => clearInterval(interval);
    }
  }, [isLoading, messages.length]);

  // Monitor content length changes for better streaming scroll behavior
  useEffect(() => {
    if (isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        // Scroll when assistant message content changes during streaming
        const scrollToBottom = () => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
          }
        };

        // Small delay to ensure rendering is complete
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, messages]);

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setShowSidebar(false);
  };

  const selectChat = async (chatId: string) => {
    try {
      // Load messages for the selected chat
      const response = await fetch(generateAPIUrl(`/api/chats/${chatId}/messages`));
      const data = await response.json();

      if (data.messages) {
        setCurrentChatId(chatId);
        // Convert database messages to chat format
        const chatMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }));
        setMessages(chatMessages);
      }
      setShowSidebar(false);
    } catch (error) {
      console.error('Error loading chat:', error);
      Alert.alert('Error', 'Failed to load chat history');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(generateAPIUrl('/api/chats'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });

      // Remove from local state
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));

      // If this was the current chat, start a new one
      if (currentChatId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete chat');
    }
  };

  const confirmDeleteChat = (chatId: string, title: string) => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteChat(chatId) }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 relative">
        {/* Main Chat Area */}
        <View className="flex-1 p-4" style={{ paddingBottom: 8 + tabBarHeight }}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                onPress={() => setShowSidebar(!showSidebar)}
              >
                <Text className="text-lg">☰</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold" style={{ color: textColor }}>
                Chat Assistant
              </Text>
            </View>
            <TouchableOpacity
              className="px-4 py-2 rounded-xl bg-blue-500"
              onPress={startNewChat}
            >
              <Text className="text-white font-medium">New Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Messages display */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-4 mb-4"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {messages.length === 0 && !isLoading && (
              <Text className="text-center mt-5 text-gray-500 dark:text-gray-400">
                Start a conversation by typing a message below
              </Text>
            )}

            {messages.map((message) => (
              <View key={message.id} className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <View className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                  {message.role === 'user' ? (
                    <Text className={`text-base leading-6 text-white`}>
                      {message.content}
                    </Text>
                  ) : (
                    <Markdown
                      style={{
                        body: {
                          color: textColor,
                          fontSize: 16,
                          lineHeight: 24,
                        },
                        heading1: {
                          color: textColor,
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginBottom: 8,
                        },
                        heading2: {
                          color: textColor,
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginBottom: 6,
                        },
                        heading3: {
                          color: textColor,
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: 4,
                        },
                        paragraph: {
                          color: textColor,
                          fontSize: 16,
                          lineHeight: 24,
                          marginBottom: 8,
                        },
                        listItem: {
                          color: textColor,
                          fontSize: 16,
                          lineHeight: 24,
                        },
                        strong: {
                          color: textColor,
                          fontWeight: 'bold',
                        },
                        em: {
                          color: textColor,
                          fontStyle: 'italic',
                        },
                        code_inline: {
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          color: textColor,
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 4,
                          fontSize: 14,
                        },
                        code_block: {
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          color: textColor,
                          padding: 8,
                          borderRadius: 4,
                          fontSize: 14,
                        },
                        blockquote: {
                          borderLeftWidth: 4,
                          borderLeftColor: '#ccc',
                          paddingLeft: 12,
                          marginLeft: 8,
                          fontStyle: 'italic',
                        },
                      }}
                    >
                      {message.content}
                    </Markdown>
                  )}
                </View>
              </View>
            ))}

            {isLoading && (
              <View className="items-start mb-4">
                <View className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                  <ActivityIndicator color={textColor} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input area */}
          <View className="flex-row items-center">
            <View className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-3">
              <TextInput
                className="text-base min-h-[40px]"
                style={{ color: textColor }}
                placeholder="Type your message here..."
                placeholderTextColor={textColor + '80'}
                value={input}
                onChangeText={(text) => handleInputChange({ target: { value: text } } as any)}
                multiline
              />
            </View>
            <TouchableOpacity
              className="ml-2 p-3 rounded-xl bg-blue-500 items-center justify-center"
              onPress={(e) => handleSubmit(e as any)}
              disabled={isLoading || !input.trim()}
              style={{ opacity: (isLoading || !input.trim()) ? 0.5 : 1 }}
            >
              <Text className="text-white font-medium">
                {isLoading ? "Sending..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>

          {error && !error.message?.includes('No relevant knowledge found') &&
            !error.message?.includes("don't have information") &&
            !error.message?.includes("specialized in helping") && (
              <View className="p-3 bg-red-500 rounded-lg mt-4">
                <Text className="text-white">{error.message}</Text>
              </View>
            )}
        </View>

        {/* Floating Sidebar Overlay */}
        {showSidebar && (
          <>
            {/* Backdrop */}
            <TouchableOpacity
              className="absolute inset-0 bg-black bg-opacity-50 z-10"
              onPress={() => setShowSidebar(false)}
              activeOpacity={1}
            />

            {/* Sidebar */}
            <View className="absolute left-0 top-0 bottom-0 w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-20">
              <View className="p-4 flex-1">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold" style={{ color: textColor }}>
                    Chat History
                  </Text>
                  <TouchableOpacity onPress={() => setShowSidebar(false)}>
                    <Text className="text-gray-500 text-xl">×</Text>
                  </TouchableOpacity>
                </View>

                {/* RAG Upload Button */}
                <TouchableOpacity
                  className="w-full p-3 bg-green-500 rounded-lg mb-4"
                  onPress={() => {
                    setShowSidebar(false);
                    router.push('/rag-upload');
                  }}
                >
                  <Text className="text-white text-center font-medium">
                    📁 Upload RAG Knowledge
                  </Text>
                </TouchableOpacity>

                {/* Chat History List */}
                <ScrollView className="flex-1">
                  {loadingChats ? (
                    <View className="items-center p-4">
                      <ActivityIndicator color={textColor} />
                      <Text className="text-gray-500 mt-2">Loading chats...</Text>
                    </View>
                  ) : chatHistory.length === 0 ? (
                    <Text className="text-gray-500 text-center p-4">
                      No chat history yet
                    </Text>
                  ) : (
                    chatHistory.map((chat) => (
                      <View key={chat.id} className="mb-2">
                        <TouchableOpacity
                          className={`p-3 rounded-lg flex-row justify-between items-center ${currentChatId === chat.id
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          onPress={() => selectChat(chat.id)}
                        >
                          <View className="flex-1">
                            <Text
                              className="font-medium text-sm"
                              style={{ color: textColor }}
                              numberOfLines={1}
                            >
                              {chat.title}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            className="p-2"
                            onPress={() => confirmDeleteChat(chat.id, chat.title)}
                          >
                            <Text className="text-red-500">🗑️</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Page;