import { useThemeColor } from '@/hooks/useThemeColor';
import { generateAPIUrl } from '@/utils/utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { fetch as expoFetch } from 'expo/fetch';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const RAGUploadPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '' });
  const tabBarHeight = useBottomTabBarHeight();

  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

  // Load existing documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await expoFetch(generateAPIUrl('/api/documents'));
      const data = await response.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Upload new document
  const uploadDocument = async () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setUploading(true);
    try {
      const response = await expoFetch(generateAPIUrl('/api/documents'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDoc.title,
          content: newDoc.content,
        }),
      });

      const data = await response.json();
      if (data.document) {
        setDocuments(prev => [data.document, ...prev]);
        setNewDoc({ title: '', content: '' });
        Alert.alert('Success', 'Document uploaded and processed successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    try {
      const response = await expoFetch(generateAPIUrl('/api/documents'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        Alert.alert('Success', 'Document deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  };

  const confirmDelete = (documentId: string, title: string) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDocument(documentId) }
      ]
    );
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1 p-4" style={{ paddingBottom: 8 + tabBarHeight }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            RAG Knowledge Base
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Upload documents to enhance the chatbot&apos;s knowledge. Documents will be processed and chunked for better retrieval.
          </Text>
        </View>

        {/* Upload Form */}
        <View className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Text className="text-lg font-semibold mb-4" style={{ color: textColor }}>
            Upload New Document
          </Text>

          {/* Title Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Document Title
            </Text>
            <TextInput
              className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ color: textColor }}
              placeholder="Enter document title..."
              placeholderTextColor={textColor + '80'}
              value={newDoc.title}
              onChangeText={(text) => setNewDoc(prev => ({ ...prev, title: text }))}
            />
          </View>

          {/* Content Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium mb-2" style={{ color: textColor }}>
              Document Content
            </Text>
            <TextInput
              className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ color: textColor, minHeight: 150 }}
              placeholder="Paste your document content here..."
              placeholderTextColor={textColor + '80'}
              value={newDoc.content}
              onChangeText={(text) => setNewDoc(prev => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg items-center"
            onPress={uploadDocument}
            disabled={uploading}
            style={{ opacity: uploading ? 0.5 : 1 }}
          >
            {uploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-medium ml-2">Processing...</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">Upload Document</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Documents List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold" style={{ color: textColor }}>
              Knowledge Base ({documents.length})
            </Text>
            <TouchableOpacity
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              onPress={loadDocuments}
              disabled={loading}
            >
              <Text className="text-blue-500 font-medium">
                {loading ? 'Loading...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center p-8">
              <ActivityIndicator color={textColor} size="large" />
              <Text className="text-gray-500 mt-2">Loading documents...</Text>
            </View>
          ) : documents.length === 0 ? (
            <View className="items-center p-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Text className="text-gray-500 text-center">
                No documents uploaded yet. Upload your first document to get started!
              </Text>
            </View>
          ) : (
            documents.map((doc) => (
              <View key={doc.id} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-semibold flex-1" style={{ color: textColor }}>
                    {doc.title}
                  </Text>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => confirmDelete(doc.id, doc.title)}
                  >
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2" numberOfLines={3}>
                  {doc.content}
                </Text>

                <Text className="text-xs text-gray-500">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RAGUploadPage;