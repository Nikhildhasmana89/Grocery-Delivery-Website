import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

// Configure helper to ensure credentials are injected dynamically
const ensureCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary configuration missing! Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in .env.local'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

/**
 * Uploads a file (Buffer, Blob, File, or Base64 String) to Cloudinary.
 * @param file - The file content to upload
 * @param folder - Optional Cloudinary folder name (e.g. 'groceries')
 */
const uploadOnCloudinary = async (
  file: Blob | Buffer | string | null | undefined,
  folder: string = 'freshkart'
): Promise<string | null> => {
  if (!file) {
    return null;
  }

  try {
    // Ensure config is loaded right before upload execution
    ensureCloudinaryConfig();

    // 1. If input is a Base64 string or image URL
    if (typeof file === 'string') {
      const result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'auto',
      });
      return result?.secure_url || null;
    }

    // 2. Convert Blob/File or Buffer to a Node Buffer
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // 3. Upload via Stream for Buffers/Blobs
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary stream upload error:', error);
            return reject(error);
          }
          resolve(result?.secure_url || null);
        }
      );

      // Write the buffer to the stream
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error in uploadOnCloudinary:', error);
    return null;
  }
};

export { cloudinary };
export default uploadOnCloudinary;