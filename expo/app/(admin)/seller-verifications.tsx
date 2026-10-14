import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';
import { PendingSellerVerification } from '@/types';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Check, X, AlertCircle, Clock } from 'lucide-react-native';

export default function SellerVerifications() {
  const [verifications, setVerifications] = useState<PendingSellerVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<PendingSellerVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_seller_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading verifications:', error);
        Alert.alert('Error', 'Failed to load seller verifications');
        return;
      }

      setVerifications(data || []);
      setReviewedCount(0);
    } catch (err) {
      console.error('Load verifications error:', err);
      Alert.alert('Error', 'An error occurred');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (verification: PendingSellerVerification) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('seller_verifications')
        .update({
          fssai_status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('seller_id', verification.sellerId);

      if (error) throw error;

      await createNotification(verification.sellerId, 'approved', '');

      Alert.alert('Success', `${verification.name}'s FSSAI has been approved!`);
      setSelectedVerification(null);
      setReviewedCount(prev => prev + 1);
      loadVerifications();
    } catch (err) {
      console.error('Approve error:', err);
      Alert.alert('Error', 'Failed to approve verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (verification: PendingSellerVerification) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Required', 'Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('seller_verifications')
        .update({
          fssai_status: 'rejected',
          rejection_reason: rejectionReason.trim(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('seller_id', verification.sellerId);

      if (error) throw error;

      await createNotification(verification.sellerId, 'rejected', rejectionReason.trim());

      Alert.alert('Success', `${verification.name}'s verification has been rejected`);
      setSelectedVerification(null);
      setRejectionReason('');
      setReviewedCount(prev => prev + 1);
      loadVerifications();
    } catch (err) {
      console.error('Reject error:', err);
      Alert.alert('Error', 'Failed to reject verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const createNotification = async (sellerId: string, status: 'approved' | 'rejected', reason: string) => {
    const title = status === 'approved'
      ? '✅ FSSAI Approved!'
      : '❌ FSSAI Rejected';

    const message = status === 'approved'
      ? 'Your FSSAI certificate has been verified. You can now create listings!'
      : `Your FSSAI certificate was rejected. Reason: ${reason}`;

    await supabase
      .from('seller_notifications')
      .insert({
        seller_id: sellerId,
        type: `fssai_${status}`,
        title,
        message,
        is_read: false,
        metadata: { reason: status === 'rejected' ? reason : null }
      })
      .catch(err => console.error('Notification error:', err));
  };

  const renderVerificationCard = (item: PendingSellerVerification) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedVerification(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>{item.name}</Text>
          <Text style={styles.sellerEmail}>{item.email}</Text>
          <Text style={styles.sellerPhone}>{item.phone}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Clock size={16} color={colors.warning} />
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.submittedText}>
          Submitted: {new Date(item.submittedAt).toLocaleDateString()}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => {
              setSelectedVerification(item);
              handleApprove(item);
            }}
          >
            <Check size={18} color={colors.white} />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => setSelectedVerification(item)}
          >
            <X size={18} color={colors.white} />
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Verifications</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{verifications.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reviewedCount}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
        </View>
      </View>

      {verifications.length === 0 ? (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color={colors.textLight} />
          <Text style={styles.emptyStateText}>No pending verifications</Text>
        </View>
      ) : (
        <FlatList
          data={verifications}
          renderItem={({ item }) => renderVerificationCard(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadVerifications();
              }}
            />
          }
        />
      )}

      {/* Rejection Modal */}
      <Modal
        visible={selectedVerification !== null && selectedVerification.fssaiStatus === 'pending'}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Verification</Text>
            <Text style={styles.modalSubtitle}>{selectedVerification?.name}</Text>

            <View style={styles.documentPreview}>
              <Image
                source={{ uri: selectedVerification?.fssaiDocumentUrl }}
                style={styles.documentImage}
                contentFit="cover"
              />
            </View>

            <View style={styles.form}>
              <Text style={styles.formLabel}>Rejection Reason (if rejecting)</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for rejection..."
                placeholderTextColor={colors.textLight}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                editable={!isProcessing}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={() => selectedVerification && handleApprove(selectedVerification)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Check size={18} color={colors.white} />
                    <Text style={styles.buttonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => selectedVerification && handleReject(selectedVerification)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <X size={18} color={colors.white} />
                    <Text style={styles.buttonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedVerification(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sellerEmail: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  sellerPhone: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  submittedText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 6,
    gap: 6,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  documentPreview: {
    marginBottom: spacing.lg,
  },
  documentImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  form: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
