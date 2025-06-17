import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Complaint } from '@/types';
import { api } from '@/lib/api'; // Your axios instance
import { useAuthStore } from './auth-store';

interface ComplaintsState {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;

  createComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => Promise<Complaint>;
  getComplaintsByBuyer: (buyerId: string) => Promise<void>;
  getComplaintsBySeller: (sellerId: string) => Promise<void>;
  getComplaintsByOrder: (orderId: string) => Promise<void>;
  updateComplaintStatus: (id: string, status: Complaint['status']) => Promise<void>;
  resolveComplaint: (id: string) => Promise<void>;
}

export const useComplaintsStore = create<ComplaintsState>()(
  persist(
    (set, get) => ({
      complaints: [],
      isLoading: false,
      error: null,

      createComplaint: async (complaintData) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.post('/api/complaints/', complaintData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const newComplaint = response.data;

          set((state) => ({
            complaints: [...state.complaints, newComplaint],
            isLoading: false,
          }));

          return newComplaint;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create complaint',
          });
          throw error;
        }
      },

      getComplaintsByBuyer: async (buyerId) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.get(`/api/complaints/?buyer=${buyerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ complaints: response.data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch complaints',
          });
        }
      },

      getComplaintsBySeller: async (sellerId) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.get(`/api/complaints/?seller=${sellerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ complaints: response.data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch complaints',
          });
        }
      },

      getComplaintsByOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.get(`/api/complaints/?order=${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ complaints: response.data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch complaints',
          });
        }
      },

      updateComplaintStatus: async (complaintId, status) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          await api.patch(`/api/complaints/${complaintId}/`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Optionally update state if needed
          set((state) => ({
            complaints: state.complaints.map(c =>
              c.id === complaintId ? { ...c, status } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update status',
          });
        }
      },

      resolveComplaint: async (complaintId) => {
        set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token;

        try {
          await api.patch(`/api/complaints/${complaintId}/`, {
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          set((state) => ({
            complaints: state.complaints.map(c =>
              c.id === complaintId ? { ...c, status: 'resolved', resolvedAt: new Date().toISOString() } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to resolve complaint',
          });
        }
      },
    }),
    {
      name: 'complaints-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
