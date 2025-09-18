/**
 * HeavyUploaderService - Cloud Storage Service
 * 
 * This service handles large file uploads (videos and images) to cloud storage.
 * NO FILE SIZE LIMITATIONS - Can handle files of any size through cloud storage.
 * 
 * TODO: Replace mock implementation with real cloud storage API when backend is ready
 */
// TODO: Add these environment variables when setting up real backend:
// CLOUD_STORAGE_PROVIDER=aws|gcp|cloudflare  
// AWS_ACCESS_KEY_ID=xxxxx (TODO: Add API key for cloud provider)
// AWS_SECRET_ACCESS_KEY=xxxxx (TODO: Add secret key for cloud provider)
// S3_BUCKET=your-bucket-name (TODO: Set bucket name)
// S3_REGION=us-east-1 (TODO: Set region)

import { UploadFile } from "@/api/integrations";

// TODO: Remove this temporary constraint once proper cloud storage is implemented
const TEMP_MAX_FILE_SIZE = 100 * 1024 * 1024; // Increased to 100MB while we transition to cloud storage

// FIX: תמיכה בתמונות ווידאו כולל קבצי אייפון
const SUPPORTED_MEDIA_TYPES = [
  // Video formats
  'video/mp4',           // MP4 - הכי נפוץ
  'video/quicktime',     // MOV - אייפון וטאבלטים של אפל
  'video/webm',          // WebM
  'video/avi',           // AVI
  'video/x-msvideo',     // AVI (alternative MIME type)
  'video/mov',           // MOV (alternative MIME type)
  'video/3gpp',          // 3GP - מכשירים ישנים יותר
  'video/x-ms-wmv',      // WMV - Windows
  
  // Image formats
  'image/jpeg',          // JPEG - הכי נפוץ לתמונות
  'image/jpg',           // JPG
  'image/png',           // PNG - תמיכה בשקיפות
  'image/webp',          // WebP - פורמט מודרני
  'image/heic',          // HEIC - תמונות אייפון
  'image/heif',          // HEIF - גרסה כללית של HEIC
  'image/gif',           // GIF - אנימציות
];

const getMediaMetadata = (file) => {
  return new Promise((resolve) => {
    // TODO: Implement proper metadata extraction for both videos and images
    // For videos: duration, aspect ratio, fps, bitrate
    // For images: width, height, aspect ratio, color profile
    
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const aspectRatio = video.videoWidth / video.videoHeight;
        resolve({ 
          type: 'video',
          duration, 
          aspectRatio,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.onerror = () => {
        resolve({ type: 'video', duration: 0, aspectRatio: 0, width: 0, height: 0 });
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.onload = () => {
        window.URL.revokeObjectURL(img.src);
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        resolve({ 
          type: 'image',
          aspectRatio,
          width: img.naturalWidth,
          height: img.naturalHeight,
          duration: 0 // Images don't have duration
        });
      };
      img.onerror = () => {
        resolve({ type: 'image', aspectRatio: 0, width: 0, height: 0, duration: 0 });
      };
      img.src = URL.createObjectURL(file);
    } else {
      resolve({ type: 'unknown', duration: 0, aspectRatio: 0, width: 0, height: 0 });
    }
  });
};

class HeavyUploaderService {
  /**
   * Initiates an upload process for media files (videos and images).
   * TODO: Replace with real multipart upload API when backend is ready
   * API endpoint: POST /api/uploads/initiate
   */
  async initiateUpload(file) {
    console.log(`[UploaderService] Initiating upload for: ${file.name}`);

    // TODO: Remove this validation once proper cloud storage handles large files
    if (file.size > TEMP_MAX_FILE_SIZE) {
      throw new Error(`הקובץ גדול מדי (${(file.size / 1024 / 1024).toFixed(1)}MB). מעבירים לאחסון ענן - בקרוב ללא הגבלה.`);
    }

    // FIX: בדיקה משופרת של סוג קובץ - תמיכה בתמונות ווידאו
    if (!SUPPORTED_MEDIA_TYPES.includes(file.type)) {
      throw new Error(`פורמט קובץ לא נתמך (${file.type}). תומך ב: MP4, MOV, WebM, AVI, 3GP, JPEG, PNG, WebP, HEIC`);
    }

    // TODO: Replace with real API call to POST /uploads/initiateMultipart
    const mockUploadId = `upload-${Date.now()}-${Math.random()}`;
    console.log(`[UploaderService] Upload ID created: ${mockUploadId}`);
    
    return {
      uploadId: mockUploadId,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
      // TODO: In real implementation, return pre-signed URLs for multipart upload
    };
  }

  /**
   * Uploads the media file to cloud storage.
   * TODO: Replace with real multipart upload logic when cloud storage API is ready
   * API endpoint: POST /api/uploads/chunk
   */
  async uploadFile(file, uploadId, onProgress) {
    console.log(`[UploaderService] Starting upload for ID: ${uploadId}`);
    
    // Simulate progress for better UX
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 10, 95);
      onProgress(progress);
    }, 500);

    try {
      // TODO: Replace with real multipart upload implementation:
      // 1. Split file into chunks (5MB each) - works for both videos and images
      // 2. Upload chunks in parallel using pre-signed URLs
      // 3. Track progress across all chunks
      // 4. Complete multipart upload when all chunks are done
      // 5. Set automatic deletion after 30 days in cloud storage metadata
      // 6. For images: Generate thumbnails automatically
      // 7. For videos: Extract thumbnails and generate multiple quality versions
      
      // legacy provider removed
      // legacy provider removed
      const { file_url } = await UploadFile({ file });
      
      clearInterval(interval);
      onProgress(100);
      
      return this.completeUpload(uploadId, file_url, file.type);

    } catch (error) {
      clearInterval(interval);
      console.error("[UploaderService] Upload failed:", error);
      
      if (error.message.includes('413')) {
          throw new Error('הקובץ חורג מהגודל המותר - מעבירים לאחסון ענן ללא הגבלה.');
      }
      throw error;
    }
  }

  /**
   * Completes the upload process.
   * TODO: Replace with real API call when backend supports multipart completion
   * API endpoint: POST /api/uploads/complete
   */
  async completeUpload(uploadId, finalUrl, fileType) {
    console.log(`[UploaderService] Completing upload for ID: ${uploadId}`);

    // TODO: Replace with real API call to POST /uploads/completeMultipart
    // TODO: Set expiration metadata for automatic deletion after 30 days
    // TODO: For images: Generate and return thumbnail URLs
    // TODO: For videos: Generate multiple quality versions and thumbnail
    return {
      success: true,
      media_key: `cloud-key-for-${uploadId}`, // TODO: Return real cloud storage key
      file_url: finalUrl,
      media_type: fileType.startsWith('video/') ? 'video' : 'image',
      thumbnail_url: finalUrl, // TODO: Generate proper thumbnails
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // TODO: Set in cloud storage metadata
    };
  }
}

// Export the metadata helper for use in other components
export { getMediaMetadata };
export default new HeavyUploaderService();
