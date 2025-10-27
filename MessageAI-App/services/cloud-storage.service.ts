// AWS API Gateway Configuration
const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'https://plk7eg9jc9.execute-api.us-east-1.amazonaws.com/prod';
const AWS_REGION = process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.EXPO_PUBLIC_S3_BUCKET || 'messageai-media-production';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

interface PreSignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    key: string;
    expiresIn: number;
  };
}

/**
 * Get pre-signed URL from API Gateway
 */
async function getPreSignedUrl(
  filename: string,
  contentType: string,
  folder: string = 'images'
): Promise<{ uploadUrl: string; key: string }> {
  try {
    console.log('🔑 Requesting presigned URL:', { filename, contentType, folder });
    
    const response = await fetch(`${API_GATEWAY_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType,
        folder,
      }),
    });

    console.log('📡 API Gateway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Gateway error response:', errorText);
      throw new Error(`API Gateway error ${response.status}: ${errorText}`);
    }

    const data: PreSignedUrlResponse = await response.json();
    console.log('✅ Got presigned URL data:', { success: data.success, hasUploadUrl: !!data.data?.uploadUrl });

    if (!data.success || !data.data) {
      throw new Error('Invalid response from API Gateway');
    }

    return {
      uploadUrl: data.data.uploadUrl,
      key: data.data.key,
    };
  } catch (error) {
    console.error('❌ Failed to get pre-signed URL:', error);
    throw new Error(`Failed to get upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file to S3 using pre-signed URL
 */
async function uploadToS3(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ size: number }> {
  try {
    // Read file as blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const fileSize = blob.size;

    // Upload to S3 using pre-signed URL
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ size: fileSize });
        } else {
          console.error('❌ S3 upload failed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          });
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', uploadUrl);
      
      // IMPORTANT: Only set Content-Type header
      // The pre-signed URL already includes encryption + metadata in its signature
      // S3 will apply them automatically - don't add extra headers!
      xhr.setRequestHeader('Content-Type', contentType);
      
      xhr.send(blob);
    });
  } catch (error) {
    console.error('❌ Upload to S3 failed:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload image to AWS S3 using pre-signed URLs
 * @param fileUri - Local file URI
 * @param filename - Unique filename
 * @param mimeType - File MIME type (e.g., 'image/jpeg')
 * @param onProgress - Progress callback
 * @returns S3 URL and metadata
 */
export async function uploadImageToS3(
  fileUri: string,
  filename: string,
  mimeType: string = 'image/jpeg',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    console.log('📤 Requesting pre-signed URL for:', filename);

    // Step 1: Get pre-signed URL from API Gateway
    const { uploadUrl, key } = await getPreSignedUrl(filename, mimeType, 'images');

    console.log('✅ Got pre-signed URL, uploading to S3...');

    // Step 2: Upload file to S3 using pre-signed URL
    const { size } = await uploadToS3(uploadUrl, fileUri, mimeType, onProgress);

    // Step 3: Construct public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    console.log('✅ Image uploaded to S3:', publicUrl);

    return {
      url: publicUrl,
      key,
      bucket: S3_BUCKET,
      size,
    };
  } catch (error) {
    console.error('❌ S3 upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload video to AWS S3 using pre-signed URLs
 * @param fileUri - Local file URI
 * @param filename - Unique filename
 * @param mimeType - File MIME type (e.g., 'video/mp4')
 * @param onProgress - Progress callback
 * @returns S3 URL and metadata
 */
export async function uploadVideoToS3(
  fileUri: string,
  filename: string,
  mimeType: string = 'video/mp4',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    console.log('📤 Requesting pre-signed URL for video:', filename);

    // Step 1: Get pre-signed URL from API Gateway
    const { uploadUrl, key } = await getPreSignedUrl(filename, mimeType, 'videos');

    console.log('✅ Got pre-signed URL, uploading video to S3...');

    // Step 2: Upload file to S3 using pre-signed URL
    const { size } = await uploadToS3(uploadUrl, fileUri, mimeType, onProgress);

    // Step 3: Construct public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    console.log('✅ Video uploaded to S3:', publicUrl);

    return {
      url: publicUrl,
      key,
      bucket: S3_BUCKET,
      size,
    };
  } catch (error) {
    console.error('❌ S3 video upload error:', error);
    throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload file to AWS S3 using pre-signed URLs
 * @param fileUri - Local file URI
 * @param filename - Unique filename
 * @param mimeType - File MIME type
 * @param onProgress - Progress callback
 * @returns S3 URL and metadata
 */
export async function uploadFileToS3(
  fileUri: string,
  filename: string,
  mimeType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    console.log('📤 Requesting pre-signed URL for file:', filename);

    // Step 1: Get pre-signed URL from API Gateway
    const { uploadUrl, key } = await getPreSignedUrl(filename, mimeType, 'files');

    console.log('✅ Got pre-signed URL, uploading file to S3...');

    // Step 2: Upload file to S3 using pre-signed URL
    const { size } = await uploadToS3(uploadUrl, fileUri, mimeType, onProgress);

    // Step 3: Construct public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    console.log('✅ File uploaded to S3:', publicUrl);

    return {
      url: publicUrl,
      key,
      bucket: S3_BUCKET,
      size,
    };
  } catch (error) {
    console.error('❌ S3 file upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

