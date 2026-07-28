import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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