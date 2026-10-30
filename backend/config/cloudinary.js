import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlpzb0td2',
  api_key: process.env.CLOUDINARY_API_KEY || '781859512355983',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'nZTwBw-NneDgcsivyhWHxKmEBek',
  secure: true
});

/**
 * Upload an image (base64 data URI, buffer, or file) to Cloudinary
 * @param {string} fileStr - base64 string or image URI
 * @param {object} options - folder, public_id, phase, etc.
 * @returns {Promise<{ url: string, secure_url: string, public_id: string, bytes: number, format: string }>}
 */
export async function uploadToCloudinary(fileStr, options = {}) {
  if (!fileStr) {
    throw new Error('No image payload provided for Cloudinary upload');
  }

  // If already a remote Cloudinary URL, don't re-upload
  if (typeof fileStr === 'string' && fileStr.startsWith('http') && !fileStr.startsWith('data:')) {
    return {
      url: fileStr,
      secure_url: fileStr,
      public_id: options.public_id || `job-evidence-${Date.now()}`
    };
  }

  const folder = options.folder || 'urban_company/worker_evidence';
  const uploadOptions = {
    folder,
    resource_type: 'image',
    tags: options.tags || ['worker_evidence', options.phase || 'general'],
    overwrite: true,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  };

  if (options.public_id) {
    uploadOptions.public_id = options.public_id;
  }

  const result = await cloudinary.uploader.upload(fileStr, uploadOptions);

  return {
    url: result.secure_url || result.url,
    secure_url: result.secure_url || result.url,
    public_id: result.public_id,
    bytes: result.bytes,
    format: result.format,
    width: result.width,
    height: result.height
  };
}

export { cloudinary };
export default cloudinary;
