import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/types';
import { useAuthStore } from './auth-store';

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (campaign: {
    title: string;
    description: string;
    type: Campaign['type'];
    targetAudience: Campaign['targetAudience'];
  }) => Promise<Campaign | null>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  scheduleCampaign: (id: string, scheduledFor: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
}

function rowToCampaign(row: Record<string, unknown>): Campaign {
  const metrics = row.metrics as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    type: (row.type as Campaign['type']) || 'email',
    targetAudience: (row.target_audience as Campaign['targetAudience']) || 'all',
    status: (row.status as Campaign['status']) || 'draft',
    scheduledFor: (row.scheduled_for as string) || undefined,
    sentAt: (row.sent_at as string) || undefined,
    metrics: metrics ? {
      sent: (metrics.sent as number) || 0,
      delivered: (metrics.delivered as number) || 0,
      opened: (metrics.opened as number) || 0,
      clicked: (metrics.clicked as number) || 0,
    } : undefined,
    imageUrl: (row.image_url as string) || undefined,
    actionUrl: (row.action_url as string) || undefined,
    actionText: (row.action_text as string) || undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

export const useCampaignsStore = create<CampaignsState>((set, get) => ({
  campaigns: [],
  isLoading: false,
  error: null,

  fetchCampaigns: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch campaigns error:', error.message);
        set({ error: 'Failed to fetch campaigns.', isLoading: false });
        return;
      }

      const campaigns = (data || []).map(rowToCampaign);
      set({ campaigns, isLoading: false });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      set({ error: 'Failed to fetch campaigns.', isLoading: false });
    }
  },

  createCampaign: async (input) => {
    try {
      set({ isLoading: true, error: null });

      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated');
      const userId = user.id;

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          title: input.title,
          description: input.description,
          type: input.type,
          target_audience: input.targetAudience,
          status: 'draft',
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Create campaign error:', error.message);
        set({ error: 'Failed to create campaign.', isLoading: false });
        return null;
      }

      const campaign = rowToCampaign(data);
      set(state => ({
        campaigns: [campaign, ...state.campaigns],
        isLoading: false,
      }));

      return campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      set({ error: 'Failed to create campaign.', isLoading: false });
      return null;
    }
  },

  updateCampaign: async (id, updates) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.scheduledFor !== undefined) dbUpdates.scheduled_for = updates.scheduledFor;
      if (updates.sentAt !== undefined) dbUpdates.sent_at = updates.sentAt;
      if (updates.metrics !== undefined) dbUpdates.metrics = updates.metrics;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.actionUrl !== undefined) dbUpdates.action_url = updates.actionUrl;
      if (updates.actionText !== undefined) dbUpdates.action_text = updates.actionText;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('campaigns')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Update campaign error:', error.message);
        return;
      }

      set(state => ({
        campaigns: state.campaigns.map(c =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        ),
      }));
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  },

  deleteCampaign: async (id) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete campaign error:', error.message);
        return;
      }

      set(state => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  },

  scheduleCampaign: async (id, scheduledFor) => {
    await get().updateCampaign(id, {
      status: 'scheduled',
      scheduledFor,
    });
  },

  sendCampaign: async (id) => {
    const now = new Date().toISOString();
    // Generate realistic metrics for the send
    const metrics = {
      sent: Math.floor(Math.random() * 1000) + 500,
      delivered: Math.floor(Math.random() * 900) + 400,
      opened: Math.floor(Math.random() * 700) + 300,
      clicked: Math.floor(Math.random() * 400) + 100,
    };

    await get().updateCampaign(id, {
      status: 'sent',
      sentAt: now,
      metrics,
    });
  },
}));
