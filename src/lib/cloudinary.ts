import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export { cloudinary };

/**
 * Checks if Cloudinary credentials are fully provided
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Uploads an image file (Buffer, Base64 string, or remote URL) to Cloudinary
 */
export async function uploadToCloudinary(
  fileInput: string | Buffer,
  folder: string = 'safirya_products'
): Promise<{
  url: string | null;
  publicId: string | null;
  width?: number;
  height?: number;
  format?: string;
  error?: string | null;
}> {
  if (!isCloudinaryConfigured()) {
    return {
      url: null,
      publicId: null,
      error: 'Cloudinary kimlik bilgileri (.env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) eksik.',
    };
  }

  try {
    let uploadTarget: string;

    if (Buffer.isBuffer(fileInput)) {
      uploadTarget = `data:image/jpeg;base64,${fileInput.toString('base64')}`;
    } else {
      uploadTarget = fileInput;
    }

    const result = await cloudinary.uploader.upload(uploadTarget, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      error: null,
    };
  } catch (err: any) {
    return {
      url: null,
      publicId: null,
      error: err?.message || 'Cloudinary görsel yükleme hatası.',
    };
  }
}

/**
 * Deletes an image from Cloudinary by its public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!isCloudinaryConfigured() || !publicId) return false;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch {
    return false;
  }
}
