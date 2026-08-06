import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { useAuthStore } from '@/store/auth-store';

/**
 * Upload an image file to Supabase Storage and return the public URL
 * @param fileUri - Local file URI from device
 * @param bucket - Supabase storage bucket name (default: 'listings')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(fileUri: string, bucket: string = 'listings'): Promise<string> {
  try {
    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    // Get file extension
    const fileExtension = fileUri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, binaryData, {
        contentType: `image/${fileExtension}`,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upload');
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicData || !publicData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    return publicData.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

/**
 * Upload multiple images and return their public URLs
 */
export async function uploadImages(
  fileUris: string[],
  bucket: string = 'listings'
): Promise<string[]> {
  try {
    const uploadPromises = fileUris.map(uri => uploadImage(uri, bucket));
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Batch upload failed:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(publicUrl: string, bucket: string = 'listings'): Promise<void> {
  try {
    // Extract file path from public URL
    const fileName = publicUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Could not extract filename from URL');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw error;
  }
}
