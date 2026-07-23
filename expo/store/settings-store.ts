import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface AppSettings {
  id: string;
  maxPortionsPerDish: number;
  maxDishesWithPortions: number;
  enforcementEnabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

interface SettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

function rowToSettings(row: Record<string, unknown>): AppSettings {
  return {
    id: row.id as string,
    maxPortionsPerDish: (row.max_portions_per_dish as number) || 4,
    maxDishesWithPortions: (row.max_dishes_with_portions as number) || 2,
    enforcementEnabled: (row.enforcement_enabled as boolean) ?? true,
    updatedAt: row.updated_at as string,
    updatedBy: row.updated_by as string | undefined,
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Fetch settings error:', error.message);
        // Use defaults if settings don't exist
        set({
          settings: {
            id: 'default',
            maxPortionsPerDish: 4,
            maxDishesWithPortions: 2,
            enforcementEnabled: true,
            updatedAt: new Date().toISOString(),
          },
          isLoading: false,
        });
        return;
      }

      set({ settings: data ? rowToSettings(data) : null, isLoading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ error: 'Failed to fetch settings', isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ isLoading: true, error: null });

      const dbUpdates: Record<string, unknown> = {};
      if (updates.maxPortionsPerDish !== undefined) dbUpdates.max_portions_per_dish = updates.maxPortionsPerDish;
      if (updates.maxDishesWithPortions !== undefined) dbUpdates.max_dishes_with_portions = updates.maxDishesWithPortions;
      if (updates.enforcementEnabled !== undefined) dbUpdates.enforcement_enabled = updates.enforcementEnabled;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('app_settings')
        .update(dbUpdates)
        .eq('id', 'default');

      if (error) {
        console.error('Update settings error:', error.message);
        set({ error: 'Failed to update settings', isLoading: false });
        throw error;
      }

      // Update local state
      const currentSettings = get().settings;
      if (currentSettings) {
        set({
          settings: { ...currentSettings, ...updates, updatedAt: new Date().toISOString() },
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ error: 'Failed to update settings', isLoading: false });
      throw error;
    }
  },
}));
