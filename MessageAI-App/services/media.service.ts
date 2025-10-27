import { uploadImageToS3, uploadFileToS3 } from './cloud-storage.service';

/**
 * Upload media file to S3 based on type
 */
export const uploadMediaToS3 = async (
  uri: string,
  type: 'image' | 'video' | 'audio' | 'file'
): Promise<string> => {
  try {
    console.log(`📤 Uploading ${type} to S3...`, uri);

    switch (type) {
      case 'image':
        return await uploadImageToS3(uri);
      
      case 'audio': {
        // Generate unique filename for audio
        const audioFilename = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
        console.log('🎤 Uploading audio file:', audioFilename);
        const result = await uploadFileToS3(uri, audioFilename, 'audio/mp4');
        console.log('✅ Audio uploaded successfully:', result.url);
        return result.url;
      }
      
      case 'file': {
        // Generate unique filename for generic file
        const filename = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await uploadFileToS3(uri, filename, 'application/octet-stream');
        return result.url;
      }
      
      default:
        throw new Error(`Unsupported media type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to upload ${type}:`, error);
    throw error;
  }
};

