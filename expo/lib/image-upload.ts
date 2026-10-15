import { supabase } from './supabase';

/** Upload a selected image, document, or video to Supabase Storage. */
export async function uploadFile(
  fileUri: string,
  bucket: string = 'listings',
  sourceName?: string,
  mimeType?: string,
  ownerId?: string,
): Promise<string> {
  try {
    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    if (/^https?:\/\//i.test(fileUri)) return fileUri;

    if (ownerId) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error('Your Supabase session is missing. Sign in again before uploading seller documents.');
      }
      if (session.user.id !== ownerId) {
        throw new Error('The signed-in Supabase user does not match the seller profile. Sign out and sign in again.');
      }
    }

    console.log('Uploading file:', fileUri);
    console.log('Bucket:', bucket);

    const cleanUri = fileUri.split(/[?#]/, 1)[0];
    const fileLabel = sourceName || cleanUri.split('/').pop() || '';
    let fileExtension = fileLabel.split('.').pop()?.toLowerCase() || '';

    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      m4v: 'video/x-m4v',
    };
    const extensionByMimeType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-m4v': 'm4v',
    };

    if (!contentTypeMap[fileExtension]) {
      fileExtension = (mimeType && extensionByMimeType[mimeType]) || 'bin';
    }
    const contentType = mimeType || contentTypeMap[fileExtension] || 'application/octet-stream';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExtension}`;
    const filePath = ownerId ? `${ownerId}/${fileName}` : fileName;

    console.log('Reading file data...');

    /*
     * Works with Expo ImagePicker URI and avoids
     * FileSystem.EncodingType.Base64 completely.
     */
    const response = await fetch(fileUri);

    if (!response.ok) {
      throw new Error(
        `Failed to read image: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    console.log(
      `File loaded: ${arrayBuffer.byteLength} bytes`
    );

    console.log(
      `Uploading ${fileName} as ${contentType}`
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error(
        'Supabase upload error:',
        JSON.stringify(error, null, 2)
      );

      throw error;
    }

    if (!data?.path) {
      throw new Error(
        'Upload succeeded but no file path was returned'
      );
    }

    console.log(
      'Upload successful:',
      data.path
    );

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error(
        'Failed to generate public URL'
      );
    }

    console.log(
      'Public URL:',
      publicData.publicUrl
    );

    return publicData.publicUrl;

  } catch (error) {
    console.error(
      'File upload failed:',
      error
    );

    throw error;
  }
}

/** Upload an image to Supabase Storage. */
export function uploadImage(fileUri: string, bucket: string = 'listings'): Promise<string> {
  return uploadFile(fileUri, bucket);
}


/**
 * Upload multiple images.
 */
export async function uploadImages(
  fileUris: string[],
  bucket: string = 'listings'
): Promise<string[]> {
  if (!fileUris || fileUris.length === 0) {
    return [];
  }

  try {
    const uploads = fileUris.map((uri) =>
      uploadImage(uri, bucket)
    );

    return await Promise.all(uploads);

  } catch (error) {
    console.error(
      'Batch upload failed:',
      error
    );

    throw error;
  }
}


/**
 * Delete image from Supabase Storage.
 */
export async function deleteImage(
  publicUrl: string,
  bucket: string = 'listings'
): Promise<void> {
  try {
    if (!publicUrl) {
      throw new Error(
        'No public URL provided'
      );
    }

    /*
     * Public URL normally looks like:
     *
     * https://xxx.supabase.co/storage/v1/object/public/listings/file.jpg
     */

    const marker = `/object/public/${bucket}/`;

    const markerIndex =
      publicUrl.indexOf(marker);

    if (markerIndex === -1) {
      throw new Error(
        'Invalid Supabase Storage public URL'
      );
    }

    // Also works when you later use folders:
    // users/123/avatar.jpg
    const filePath = decodeURIComponent(
      publicUrl.substring(
        markerIndex + marker.length
      )
    );

    console.log(
      'Deleting Supabase file:',
      filePath
    );

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(
        'Delete error:',
        error
      );

      throw error;
    }

    console.log(
      'Image deleted successfully'
    );

  } catch (error) {
    console.error(
      'Image deletion failed:',
      error
    );

    throw error;
  }
}