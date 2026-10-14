import { supabase } from './supabase';

/**
 * Upload image to Supabase Storage.
 */
export async function uploadImage(
  fileUri: string,
  bucket: string = 'listings'
): Promise<string> {
  try {
    if (!fileUri) {
      throw new Error('No file URI provided');
    }

    console.log('Uploading image:', fileUri);
    console.log('Bucket:', bucket);

    // Get extension safely.
    // Remove query params first because web/blob URLs can contain them.
    const cleanUri = fileUri.split('?')[0];

    let fileExtension =
      cleanUri.split('.').pop()?.toLowerCase() || 'jpg';

    // Ensure extension is actually supported.
    const validExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
    ];

    if (!validExtensions.includes(fileExtension)) {
      fileExtension = 'jpg';
    }

    const fileName =
      `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}.${fileExtension}`;

    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    const contentType =
      contentTypeMap[fileExtension] || 'image/jpeg';

    console.log('Reading image data...');

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
      `Image loaded: ${arrayBuffer.byteLength} bytes`
    );

    console.log(
      `Uploading ${fileName} as ${contentType}`
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
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
      'Image upload failed:',
      error
    );

    throw error;
  }
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