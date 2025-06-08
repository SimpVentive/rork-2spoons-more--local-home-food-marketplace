import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Complaint } from '@/types';

interface ComplaintsState {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => Promise<Complaint>;
  getComplaintsByBuyer: (buyerId: string) => Complaint[];
  getComplaintsBySeller: (sellerId: string) => Complaint[];
  getComplaintsByOrder: (orderId: string) => Complaint[];
  updateComplaintStatus: (complaintId: string, status: 'pending' | 'reviewing' | 'resolved') => Promise<void>;
  resolveComplaint: (complaintId: string) => Promise<void>;
}

export const useComplaintsStore = create<ComplaintsState>()(
  persist(
    (set, get) => ({
      complaints: [],
      isLoading: false,
      error: null,
      
      createComplaint: async (complaintData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Generate a unique ID
          const id = Math.random().toString(36).substring(2, 15);
          
          const newComplaint: Complaint = {
            id,
            ...complaintData,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            complaints: [...state.complaints, newComplaint],
            isLoading: false,
          }));
          
          return newComplaint;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      getComplaintsByBuyer: (buyerId) => {
        return get().complaints.filter(complaint => complaint.buyerId === buyerId);
      },
      
      getComplaintsBySeller: (sellerId) => {
        return get().complaints.filter(complaint => complaint.sellerId === sellerId);
      },
      
      getComplaintsByOrder: (orderId) => {
        return get().complaints.filter(complaint => complaint.orderId === orderId);
      },
      
      updateComplaintStatus: async (complaintId, status) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            complaints: state.complaints.map(complaint => 
              complaint.id === complaintId 
                ? { ...complaint, status } 
                : complaint
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      resolveComplaint: async (complaintId) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            complaints: state.complaints.map(complaint => 
              complaint.id === complaintId 
                ? { 
                    ...complaint, 
                    status: 'resolved',
                    resolvedAt: new Date().toISOString(),
                  } 
                : complaint
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
    }),
    {
      name: 'complaints-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);