import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  Plus,
  FileText,
  ImageIcon,
  Video,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { uploadFile } from '@/lib/image-upload';
import { supabase } from '@/lib/supabase';

type SelectedMedia = {
  uri: string;
  name?: string;
  mimeType?: string | null;
};

type VerificationStatus = 'loading' | 'none' | 'pending' | 'approved' | 'rejected' | 'error';

export default function SellerProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [fasiCertificate, setFasiCertificate] = useState<SelectedMedia | null>(null);
  const [ingredientPhotos, setIngredientPhotos] = useState<SelectedMedia[]>([]);
  const [cookingVideo, setCookingVideo] = useState<SelectedMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('loading');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    void loadVerificationStatus();
  }, [user?.id]);

  const loadVerificationStatus = async () => {
    if (!user?.id) {
      setVerificationStatus('error');
      return;
    }

    setVerificationStatus('loading');
    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select('fssai_status, rejection_reason')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setVerificationStatus(data?.fssai_status || 'none');
      setRejectionReason(data?.rejection_reason || '');
    } catch (error) {
      console.error('Failed to load seller verification status:', error);
      setVerificationStatus('error');
    }
  };

  const pickFasiCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFasiCertificate({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickIngredientPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setIngredientPhotos(current => current.length < 5 ? [
          ...current,
          { uri: asset.uri, name: asset.fileName ?? undefined, mimeType: asset.mimeType },
        ] : current);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeIngredientPhoto = (index: number) => {
    setIngredientPhotos(ingredientPhotos.filter((_, i) => i !== index));
  };

  const pickCookingVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setCookingVideo({
          uri: asset.uri,
          name: asset.fileName ?? undefined,
          mimeType: asset.mimeType,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleContinue = async () => {
    if (verificationStatus !== 'none' && verificationStatus !== 'rejected') {
      Alert.alert('Setup unavailable', 'Seller documents cannot be changed while the review is pending or after approval.');
      return;
    }

    if (!fasiCertificate) {
      Alert.alert('Required', 'Please upload your FASI certificate');
      return;
    }

    if (ingredientPhotos.length === 0) {
      Alert.alert('Required', 'Please upload at least one ingredient photo');
      return;
    }

    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in again before completing your seller setup.');
      return;
    }

    setIsLoading(true);
    try {
      const fasiUrl = await uploadFile(
        fasiCertificate.uri,
        'seller-documents',
        fasiCertificate.name,
        fasiCertificate.mimeType ?? undefined,
        user.id,
      );
      const photoUrls = await Promise.all(ingredientPhotos.map(photo =>
        uploadFile(photo.uri, 'seller-photos', photo.name, photo.mimeType ?? undefined, user.id),
      ));
      const videoUrl = cookingVideo
        ? await uploadFile(
            cookingVideo.uri,
            'seller-videos',
            cookingVideo.name,
            cookingVideo.mimeType ?? undefined,
            user.id,
          )
        : null;

      const profileUpdated = await updateProfile({ isChef: true });
      if (!profileUpdated) {
        throw new Error('Could not update your seller profile.');
      }

      const verificationResult = verificationStatus === 'rejected'
        ? await supabase.rpc('resubmit_seller_verification', {
            p_seller_id: user.id,
            p_fssai_document_url: fasiUrl,
            p_ingredient_photos: photoUrls,
            p_cooking_video_url: videoUrl,
          })
        : await supabase
            .from('seller_verifications')
            .insert({
              seller_id: user.id,
              fssai_document_url: fasiUrl,
              ingredient_photos: photoUrls,
              cooking_video_url: videoUrl,
            });

      if (verificationResult.error) throw verificationResult.error;

      if (verificationStatus === 'rejected') {
        useAuthStore.setState(state => ({
          user: state.user
            ? { ...state.user, fssaiStatus: 'pending', fssaiVerifiedAt: null }
            : state.user,
        }));
      }

      Alert.alert('Submitted', 'Your documents are now under review. You can’t edit them again unless the admin rejects them.');
      setTimeout(() => {
        router.replace('/(tabs)/home' as any);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {verificationStatus === 'rejected' ? 'Resubmit Seller Documents' : 'Complete Your Profile'}
        </Text>
        <Text style={styles.subtitle}>
          Help customers know more about you and your cooking
        </Text>
      </View>

      {verificationStatus === 'loading' && (
        <View style={styles.statusSection}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.statusText}>Checking your verification status...</Text>
        </View>
      )}

      {verificationStatus === 'error' && (
        <View style={styles.statusSection}>
          <AlertCircle size={28} color={colors.error} />
          <Text style={styles.statusTitle}>Could not check your review status</Text>
          <Text style={styles.statusText}>Your documents stay locked until the status can be verified.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void loadVerificationStatus()}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {(verificationStatus === 'pending' || verificationStatus === 'approved') && (
        <View style={styles.statusSection}>
          {verificationStatus === 'pending'
            ? <Clock size={28} color={colors.warning} />
            : <CheckCircle size={28} color={colors.success} />}
          <Text style={styles.statusTitle}>
            {verificationStatus === 'pending' ? 'Documents under review' : 'Seller verified'}
          </Text>
          <Text style={styles.statusText}>
            {verificationStatus === 'pending'
              ? 'You can’t edit or replace your documents while the admin review is in progress.'
              : 'Your documents are approved. They can no longer be edited.'}
          </Text>
        </View>
      )}

      {(verificationStatus === 'none' || verificationStatus === 'rejected') && <>
      {verificationStatus === 'rejected' && (
        <View style={styles.rejectionNotice}>
          <AlertCircle size={22} color={colors.error} />
          <View style={styles.rejectionNoticeText}>
            <Text style={styles.statusTitle}>Changes requested</Text>
            <Text style={styles.statusText}>
              {rejectionReason || 'The admin rejected your documents. Upload corrected files to resubmit.'}
            </Text>
          </View>
        </View>
      )}

      {/* FASI Certificate */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={24} color={colors.primary} />
          <View>
            <Text style={styles.sectionTitle}>FASI Certificate</Text>
            <Text style={styles.sectionSubtitle}>Food Safety License (Required)</Text>
          </View>
        </View>

        {fasiCertificate ? (
          <View style={styles.uploadedItem}>
            <CheckCircle size={20} color={colors.success} fill={colors.success} />
            <Text style={styles.uploadedText}>Certificate uploaded</Text>
            <TouchableOpacity onPress={() => setFasiCertificate(null)}>
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickFasiCertificate}>
            <Plus size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Upload Certificate (PDF or Image)</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.helperText}>
          Your FASI license is essential for operating as a food vendor. We'll help guide you through the process.
        </Text>
      </View>

      {/* Ingredient Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ImageIcon size={24} color={colors.primary} />
          <View>
            <Text style={styles.sectionTitle}>Ingredient Photos</Text>
            <Text style={styles.sectionSubtitle}>Show your quality ingredients (Required)</Text>
          </View>
        </View>

        <View style={styles.photoGrid}>
          {ingredientPhotos.map((photo, index) => (
            <View key={index} style={styles.photoCard}>
              <Image
                source={{ uri: photo.uri }}
                style={styles.photo}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeIngredientPhoto(index)}
              >
                <Trash2 size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {ingredientPhotos.length < 5 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickIngredientPhoto}>
              <Plus size={32} color={colors.primary} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.helperText}>
          Upload photos of your fresh ingredients. You can add up to 5 photos.
          ({ingredientPhotos.length}/5)
        </Text>
      </View>

      {/* Cooking Video */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Video size={24} color={colors.primary} />
          <View>
            <Text style={styles.sectionTitle}>Cooking Video</Text>
            <Text style={styles.sectionSubtitle}>Show your cooking skills (Optional)</Text>
          </View>
        </View>

        {cookingVideo ? (
          <View style={styles.uploadedItem}>
            <CheckCircle size={20} color={colors.success} fill={colors.success} />
            <Text style={styles.uploadedText}>Video uploaded</Text>
            <TouchableOpacity onPress={() => setCookingVideo(null)}>
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickCookingVideo}>
            <Plus size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Upload Video (30 seconds - 2 minutes)</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.helperText}>
          A short video of you cooking will help build trust with customers. This is optional but recommended.
        </Text>
      </View>

      <Button
        title={isLoading
          ? 'Submitting documents...'
          : verificationStatus === 'rejected' ? 'Resubmit for Review' : 'Submit for Review'}
        onPress={handleContinue}
        disabled={isLoading || !fasiCertificate || ingredientPhotos.length === 0}
        style={styles.submitButton}
      />

      <Text style={styles.disclaimerText}>
        By continuing, you agree that all uploaded documents are authentic and you comply with local food safety regulations.
      </Text>
      </>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  uploadButtonText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  uploadedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}10`,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  uploadedText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.success,
    fontWeight: typography.weights.semibold,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addPhotoText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    lineHeight: 18,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  statusSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  statusTitle: {
    color: colors.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  statusText: {
    color: colors.textLight,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: `${colors.error}10`,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  rejectionNoticeText: {
    flex: 1,
    gap: spacing.xs,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
