import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS_REGION is automatically provided by Lambda runtime
const s3Client = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET || 'messageai-media-production';

/**
 * Lambda function to generate pre-signed URLs for S3 upload/download
 * 
 * POST /upload - Get pre-signed URL for upload
 * Body: { filename, contentType, folder }
 * 
 * POST /download - Get pre-signed URL for download
 * Body: { key }
 */
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const path = event.path || event.requestContext?.http?.path || '/upload';
    
    // Handle upload request
    if (path.includes('/upload')) {
      return await handleUpload(body);
    }
    
    // Handle download request
    if (path.includes('/download')) {
      return await handleDownload(body);
    }
    
    return errorResponse(400, 'Invalid endpoint');
    
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(500, error.message);
  }
};

/**
 * Generate pre-signed URL for upload
 */
async function handleUpload(body) {
  const { filename, contentType, folder = 'images' } = body;
  
  // Validate input
  if (!filename) {
    return errorResponse(400, 'Missing filename');
  }
  
  if (!contentType) {
    return errorResponse(400, 'Missing contentType');
  }
  
  // Validate content type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/mpeg',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'application/pdf', 'application/zip', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(contentType)) {
    return errorResponse(400, `Content type not allowed: ${contentType}`);
  }
  
  // Generate unique key
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;
  
  // Generate pre-signed URL
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    Metadata: {
      'uploaded-by': 'messageai-app',
      'upload-timestamp': new Date().toISOString()
    }
  });
  
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300 // 5 minutes
  });
  
  return successResponse({
    uploadUrl: presignedUrl,
    key: key,
    expiresIn: 300
  });
}

/**
 * Generate pre-signed URL for download
 */
async function handleDownload(body) {
  const { key } = body;
  
  // Validate input
  if (!key) {
    return errorResponse(400, 'Missing key');
  }
  
  // Generate pre-signed URL
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });
  
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600 // 1 hour
  });
  
  return successResponse({
    downloadUrl: presignedUrl,
    expiresIn: 3600
  });
}

/**
 * Success response helper
 */
function successResponse(data) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      data: data
    })
  };
}

/**
 * Error response helper
 */
function errorResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  };
}

