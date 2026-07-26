import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) {
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result?.secure_url || null);
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Error preparing file for Cloudinary upload:', error);
    return null;
  }
};

export default uploadOnCloudinary;