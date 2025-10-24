import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const getCacheDir = () => FileSystem.cacheDirectory ? FileSystem.cacheDirectory + 'videos/' : null;
const getThumbnailDir = () => FileSystem.cacheDirectory ? FileSystem.cacheDirectory + 'thumbnails/' : null;

/**
 * Initialize video cache directories
 */
export const initVideoCache = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    console.log('ℹ️  Video cache not available on web');
    return;
  }
  
  if (!FileSystem.cacheDirectory) {
    console.warn('⚠️  FileSystem.cacheDirectory not available yet, skipping cache init');
    return;
  }
  
  try {
    const CACHE_DIR = getCacheDir();
    const THUMBNAIL_DIR = getThumbnailDir();
    
    if (!CACHE_DIR || !THUMBNAIL_DIR) return;
    
    const videoDirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!videoDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      console.log('✅ Video cache directory created');
    }

    const thumbnailDirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    if (!thumbnailDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(THUMBNAIL_DIR, { intermediates: true });
      console.log('✅ Thumbnail cache directory created');
    }
  } catch (error) {
    console.error('❌ Error initializing video cache:', error);
  }
};

/**
 * Generate a cache filename from URL
 */
const getCacheFilename = (url: string): string => {
  // Extract filename from URL or generate from hash
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1].split('?')[0];
  return filename || `video_${Date.now()}.mp4`;
};

/**
 * Check if video is cached locally
 */
export const isVideoCached = async (videoUrl: string): Promise<boolean> => {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return false;
  
  try {
    const CACHE_DIR = getCacheDir();
    if (!CACHE_DIR) return false;
    
    const filename = getCacheFilename(videoUrl);
    const localPath = CACHE_DIR + filename;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists;
  } catch (error) {
    return false;
  }
};

/**
 * Get cached video URI or download if not cached
 */
export const getCachedVideoUri = async (
  videoUrl: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return videoUrl;
  
  // If it's already a local URI, return it
  if (!videoUrl.startsWith('http')) {
    return videoUrl;
  }

  try {
    const CACHE_DIR = getCacheDir();
    if (!CACHE_DIR) return videoUrl;
    
    const filename = getCacheFilename(videoUrl);
    const localPath = CACHE_DIR + filename;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      console.log('✅ Video already cached:', filename);
      return localPath;
    }

    // Download and cache
    console.log('📥 Downloading video to cache:', filename);
    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      localPath,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        onProgress?.(progress * 100);
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (result?.uri) {
      console.log('✅ Video cached successfully:', filename);
      return result.uri;
    }

    return videoUrl; // Fallback to original URL
  } catch (error) {
    console.error('❌ Error caching video:', error);
    return videoUrl; // Fallback to original URL
  }
};

/**
 * Cache thumbnail image
 */
export const cacheThumbnail = async (thumbnailUrl: string): Promise<string> => {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return thumbnailUrl;
  
  // If it's already a local URI, return it
  if (!thumbnailUrl.startsWith('http')) {
    return thumbnailUrl;
  }

  try {
    const THUMBNAIL_DIR = getThumbnailDir();
    if (!THUMBNAIL_DIR) return thumbnailUrl;
    
    const filename = getCacheFilename(thumbnailUrl);
    const localPath = THUMBNAIL_DIR + filename;

    // Check if already cached
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      return localPath;
    }

    // Download and cache
    const downloadResumable = FileSystem.createDownloadResumable(thumbnailUrl, localPath);
    const result = await downloadResumable.downloadAsync();
    
    if (result?.uri) {
      console.log('✅ Thumbnail cached:', filename);
      return result.uri;
    }

    return thumbnailUrl;
  } catch (error) {
    console.error('❌ Error caching thumbnail:', error);
    return thumbnailUrl;
  }
};

/**
 * Clear video cache (for maintenance)
 */
export const clearVideoCache = async (): Promise<void> => {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return;
  
  try {
    const CACHE_DIR = getCacheDir();
    const THUMBNAIL_DIR = getThumbnailDir();
    
    if (CACHE_DIR) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
    if (THUMBNAIL_DIR) {
      await FileSystem.deleteAsync(THUMBNAIL_DIR, { idempotent: true });
    }
    await initVideoCache();
    console.log('✅ Video cache cleared');
  } catch (error) {
    console.error('❌ Error clearing video cache:', error);
  }
};

/**
 * Get cache size
 */
export const getVideoCacheSize = async (): Promise<number> => {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return 0;
  
  try {
    const CACHE_DIR = getCacheDir();
    const THUMBNAIL_DIR = getThumbnailDir();
    
    if (!CACHE_DIR || !THUMBNAIL_DIR) return 0;
    
    const videoDirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    const thumbnailDirInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR);
    
    let totalSize = 0;
    
    if (videoDirInfo.exists) {
      const videoFiles = await FileSystem.readDirectoryAsync(CACHE_DIR);
      for (const file of videoFiles) {
        const fileInfo = await FileSystem.getInfoAsync(CACHE_DIR + file);
        totalSize += fileInfo.size || 0;
      }
    }

    if (thumbnailDirInfo.exists) {
      const thumbnailFiles = await FileSystem.readDirectoryAsync(THUMBNAIL_DIR);
      for (const file of thumbnailFiles) {
        const fileInfo = await FileSystem.getInfoAsync(THUMBNAIL_DIR + file);
        totalSize += fileInfo.size || 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('❌ Error getting cache size:', error);
    return 0;
  }
};

