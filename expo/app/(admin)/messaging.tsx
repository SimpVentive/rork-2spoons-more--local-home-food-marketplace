import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Send, 
  User,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  Phone,
  Mail,
  Info
} from 'lucide-react-native';
import type { AdminConversation, AdminMessage, User as UserType } from '@/types';
import { fetchUserProfile } from '@/lib/supabase';
import { useMessagingStore } from '@/store/messaging-store';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AdminMessagingScreen() {
  const router = useRouter();
  const {
    conversations: storeConversations,
    messages: storeMessages,
    isLoading: storeLoading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
  } = useMessagingStore();

  const [filteredConversations, setFilteredConversations] = useState<AdminConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [userDetails, setUserDetails] = useState<UserType | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, storeConversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      loadUserDetails(selectedConversation.userId);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setIsLoading(true);
    await fetchConversations();
    setIsLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    await fetchMessages(conversationId);

    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const user = await fetchUserProfile(userId);
      if (user) {
        setUserDetails(user);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const filterConversations = () => {
    if (!searchQuery) {
      setFilteredConversations(storeConversations);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = storeConversations.filter(
      conv => conv.userName.toLowerCase().includes(query)
    );
    
    setFilteredConversations(filtered);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation.id, selectedConversation.userId, newMessage.trim(), 'admin1');
    setNewMessage('');

    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderConversationItem = ({ item }: { item: AdminConversation }) => (
    <TouchableOpacity 
      style={[
        styles.conversationItem,
        selectedConversation?.id === item.id && styles.selectedConversation
      ]}
      onPress={() => setSelectedConversation(item)}
    >
      <Image 
        source={{ uri: item.userImage }} 
        style={styles.userAvatar} 
      />
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.timeStamp}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
      
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: AdminMessage }) => {
    const isAdmin = item.senderId === 'admin1';
    
    return (
      <View style={[
        styles.messageContainer,
        isAdmin ? styles.adminMessage : styles.userMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isAdmin ? styles.adminBubble : styles.userBubble
        ]}>
          <Text style={[
            styles.messageText,
            isAdmin ? styles.adminMessageText : styles.userMessageText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!selectedConversation ? (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.textLight} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.adminAccent} />
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredConversations}
              renderItem={renderConversationItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.conversationsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No conversations found</Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedConversation(null)}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: selectedConversation.userImage }} 
              style={styles.chatUserAvatar} 
            />
            
            <View style={styles.chatUserInfo}>
              <Text style={styles.chatUserName}>{selectedConversation.userName}</Text>
              <Text style={styles.chatUserStatus}>
                {userDetails?.isChef ? 'Chef' : 'Customer'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => {
                if (userDetails) {
                  router.push(`/admin/user-details/${userDetails.id}` as any);
                }
              }}
            >
              <Info size={24} color={colors.adminAccent} />
            </TouchableOpacity>
          </View>
          
          {userDetails && (
            <View style={styles.userDetailsCard}>
              <View style={styles.userDetailItem}>
                <Phone size={16} color={colors.textLight} />
                <Text style={styles.userDetailText}>{userDetails.phone}</Text>
              </View>
              
              <View style={styles.userDetailItem}>
                <Mail size={16} color={colors.textLight} />
                <Text style={styles.userDetailText}>{userDetails.email}</Text>
              </View>
              
              <View style={styles.userDetailItem}>
                <User size={16} color={colors.textLight} />
                <Text style={styles.userDetailText}>
                  {userDetails.isChef ? 'Chef Account' : 'Customer Account'}
                </Text>
              </View>
            </View>
          )}
          
          <FlatList
            ref={flatListRef}
            data={storeMessages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            }
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={newMessage.trim() ? colors.white : '#A0AEC0'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  conversationsList: {
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedConversation: {
    backgroundColor: '#E3F2FD',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeStamp: {
    fontSize: 12,
    color: colors.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textLight,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.adminAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  unreadCount: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  chatUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chatUserStatus: {
    fontSize: 12,
    color: colors.textLight,
  },
  infoButton: {
    padding: 8,
  },
  userDetailsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetailText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  adminMessage: {
    alignSelf: 'flex-end',
  },
  userMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  adminBubble: {
    backgroundColor: colors.adminAccent,
    borderTopRightRadius: 4,
  },
  userBubble: {
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  adminMessageText: {
    color: colors.white,
  },
  userMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.adminAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
});
