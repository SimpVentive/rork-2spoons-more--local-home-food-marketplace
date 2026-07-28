import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Complaint } from '@/types';
import { zustandStorage } from '@/lib/storage';

interface ComplaintsState {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  fetchComplaints: () => Promise<void>;
  createComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => Promise<Complaint>;
  getComplaintsByBuyer: (buyerId: string) => Complaint[];
  getComplaintsBySeller: (sellerId: string) => Complaint[];
  getComplaintsByOrder: (orderId: string) => Complaint[];
  updateComplaintStatus: (complaintId: string, status: Complaint['status']) => Promise<void>;
  resolveComplaint: (complaintId: string) => Promise<void>;
}

function rowToComplaint(row: Record<string, unknown>): Complaint {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: (row.user_name as string) || '',
    userEmail: (row.user_email as string) || '',
    orderId: row.order_id as string | undefined,
    listingId: row.listing_id as string | undefined,
    sellerId: row.seller_id as string | undefined,
    type: (row.type as Complaint['type']) || 'other',
    title: row.title as string,
    description: (row.description as string) || '',
    status: (row.status as Complaint['status']) || 'pending',
    priority: (row.priority as Complaint['priority']) || 'medium',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: row.resolved_at as string | undefined,
    adminNotes: row.admin_notes as string | undefined,
    resolution: row.resolution as string | undefined,
  };
}

export const useComplaintsStore = create<ComplaintsState>()(
  persist(
    (set, get) => ({
      complaints: [],
      isLoading: false,
      error: null,

      fetchComplaints: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch complaints error:', error.message);
            set({ error: 'Failed to fetch complaints', isLoading: false });
            return;
          }

          set({ complaints: (data || []).map(rowToComplaint), isLoading: false });
        } catch (error) {
          console.error('Error fetching complaints:', error);
          set({ error: 'Failed to fetch complaints', isLoading: false });
        }
      },

      createComplaint: async (complaintData) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('complaints')
            .insert({
              user_id: complaintData.userId,
              user_name: complaintData.userName,
              user_email: complaintData.userEmail,
              order_id: complaintData.orderId,
              listing_id: complaintData.listingId,
              seller_id: complaintData.sellerId,
              type: complaintData.type,
              title: complaintData.title,
              description: complaintData.description,
              status: 'pending',
              priority: complaintData.priority || 'medium',
            })
            .select()
            .single();

          if (error) {
            console.error('Create complaint error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const newComplaint = rowToComplaint(data);
          set(state => ({ complaints: [...state.complaints, newComplaint], isLoading: false }));
          return newComplaint;
        } catch (error) {
          set({ error: 'Failed to create complaint', isLoading: false });
          throw error;
        }
      },

      getComplaintsByBuyer: (buyerId) => {
        return get().complaints.filter(c => c.userId === buyerId);
      },

      getComplaintsBySeller: (sellerId) => {
        return get().complaints.filter(c => c.sellerId === sellerId);
      },

      getComplaintsByOrder: (orderId) => {
        return get().complaints.filter(c => c.orderId === orderId);
      },

      updateComplaintStatus: async (complaintId, status) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from('complaints')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', complaintId);

          if (error) {
            console.error('Update complaint status error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          set(state => ({
            complaints: state.complaints.map(c =>
              c.id === complaintId ? { ...c, status } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to update complaint status', isLoading: false });
          throw error;
        }
      },

      resolveComplaint: async (complaintId) => {
        set({ isLoading: true, error: null });
        try {
          const now = new Date().toISOString();
          const { error } = await supabase
            .from('complaints')
            .update({ status: 'resolved', resolved_at: now, updated_at: now })
            .eq('id', complaintId);

          if (error) {
            console.error('Resolve complaint error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          set(state => ({
            complaints: state.complaints.map(c =>
              c.id === complaintId ? { ...c, status: 'resolved', resolvedAt: now } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: 'Failed to resolve complaint', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'complaints-storage',
      storage: zustandStorage,
    }
  )
);
