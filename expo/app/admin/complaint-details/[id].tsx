import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, User, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  resolution: string;
}

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const complaint: Complaint = {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name || '',
          userEmail: data.user_email || '',
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          resolution: data.resolution || '',
        };
        setComplaint(complaint);
        setResolution(complaint.resolution);
      }
    } catch (error) {
      console.error('Error loading complaint:', error);
      Alert.alert('Error', 'Failed to load complaint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (complaint) {
        await supabase
          .from('complaints')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', complaint.id);

        Alert.alert('Success', `Complaint status updated to ${newStatus}`);
        loadComplaint();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update complaint status');
    }
  };

  const handleSaveResolution = async () => {
    try {
      setIsSaving(true);
      if (complaint) {
        await supabase
          .from('complaints')
          .update({
            resolution,
            status: 'resolved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', complaint.id);

        Alert.alert('Success', 'Resolution saved');
        loadComplaint();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save resolution');
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      default:
        return colors.success;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.warning;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Complaint not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Complaint Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.titleRow}>
          <AlertTriangle size={24} color={getPriorityColor(complaint.priority)} />
          <View style={{ flex: 1 }}>
            <Text style={styles.complaintTitle}>{complaint.title}</Text>
            <View style={styles.badgesRow}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${getPriorityColor(complaint.priority)}15` },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: getPriorityColor(complaint.priority) }]}
                >
                  {complaint.priority.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(complaint.status)}15` },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: getStatusColor(complaint.status) }]}
                >
                  {complaint.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Complainant</Text>
        <View style={styles.infoRow}>
          <User size={16} color={colors.textLight} />
          <Text style={styles.value}>{complaint.userName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{complaint.userEmail}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={16} color={colors.textLight} />
          <Text style={styles.value}>{new Date(complaint.createdAt).toLocaleString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{complaint.description}</Text>

        <Text style={styles.sectionTitle}>Resolution</Text>
        <TextInput
          style={styles.resolutionInput}
          placeholder="Enter resolution details..."
          value={resolution}
          onChangeText={setResolution}
          multiline
          numberOfLines={4}
          editable={complaint.status !== 'closed'}
        />

        <Text style={styles.sectionTitle}>Change Status</Text>
        <View style={styles.statusButtons}>
          {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                complaint.status === status && styles.activeStatusButton,
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  complaint.status === status && styles.activeStatusButtonText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isSaving ? 'Saving...' : 'Save Resolution'}
          onPress={handleSaveResolution}
          disabled={isSaving || complaint.status === 'closed'}
          size="large"
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  detailsSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  complaintTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    lineHeight: 20,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  resolutionInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  activeStatusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  activeStatusButtonText: {
    color: colors.white,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
