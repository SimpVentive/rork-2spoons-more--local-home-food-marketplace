import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { AdminConversation, AdminMessage } from '@/types';
import { fetchUserProfilesByIds } from '@/lib/supabase';

interface MessagingState {
  conversations: AdminConversation[];
  messages: AdminMessage[];
  isLoading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, recipientId: string, content: string, adminId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

function rowToMessage(row: Record<string, unknown>): AdminMessage {
  return {
    id: row.id as string,
    senderId: row.sender_id as string,
    recipientId: row.recipient_id as string,
    content: row.content as string,
    isRead: (row.is_read as boolean) || false,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: rawMessages, error } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch conversations error:', error.message);
        set({ error: 'Failed to fetch conversations.', isLoading: false });
        return;
      }

      if (!rawMessages || rawMessages.length === 0) {
        set({ conversations: [], isLoading: false });
        return;
      }

      // Group messages by conversation_id
      const rawConvMap = new Map<string, AdminMessage[]>();
      const allUserIds = new Set<string>();

      for (const row of rawMessages as Record<string, unknown>[]) {
        const convId = (row.conversation_id as string) || '';
        if (!rawConvMap.has(convId)) rawConvMap.set(convId, []);
        rawConvMap.get(convId)!.push(rowToMessage(row));
        allUserIds.add(row.sender_id as string);
        allUserIds.add(row.recipient_id as string);
      }

      // Fetch user profiles for display
      const users = await fetchUserProfilesByIds([...allUserIds]);
      const userMap = new Map(users.map(u => [u.id, u]));

      // Build conversation summaries
      const conversations: AdminConversation[] = [];
      for (const [convId, msgs] of rawConvMap) {
        const sorted = msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastMsg = sorted[0];
        const unreadCount = sorted.filter(m => !m.isRead && m.senderId !== 'admin1').length;

        // Find the non-admin user for display info
        const uniqueIds = [...new Set(msgs.flatMap(m => [m.senderId, m.recipientId]))];
        const otherUserId = uniqueIds.find(id => id !== 'admin1') || '';

        const user = userMap.get(otherUserId);

        conversations.push({
          id: convId,
          userId: otherUserId,
          userName: user?.name || 'Unknown User',
          userImage: user?.profileImage || '',
          lastMessage: lastMsg.content,
          unreadCount,
          updatedAt: lastMsg.createdAt,
        });
      }

      conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ error: 'Failed to fetch conversations.', isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch messages error:', error.message);
        set({ error: 'Failed to fetch messages.', isLoading: false });
        return;
      }

      const messages = (data || []).map(rowToMessage);
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to fetch messages.', isLoading: false });
    }
  },

  sendMessage: async (conversationId: string, recipientId: string, content: string, adminId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminId,
          recipient_id: recipientId,
          content,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Send message error:', error.message);
        return;
      }

      const newMsg = rowToMessage(data);
      set(state => ({
        messages: [...state.messages, newMsg],
      }));

      // Update conversation in the list
      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      await supabase
        .from('admin_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  },
}));
