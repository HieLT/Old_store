import { v2 as cloudinary } from 'cloudinary';

function extractPublicIdFromUrl(url: string): string {
    const urlParts = url.split('/');
    console.log(urlParts);
    
    const fileName = urlParts[urlParts.length - 1];

    
    
    return fileName;
}

class CloudinaryService {
    constructor() {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_NAME, 
            api_key: process.env.CLOUDINARY_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET_KEY 
        });
    }

    async uploadImages(images: { buffer: Buffer; originalname: string }[], folder: string): Promise<string[]> {
        try {
            const uploadPromises = images.map(image => 
                new Promise<string>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder, public_id: image.originalname.split('.')[0] },
                        (error, result) => {
                            if (error) return reject(error);
                            if (result && result.secure_url) {
                                resolve(result.secure_url);
                            } else {
                                reject(new Error('Failed to get secure_url from Cloudinary'));
                            }
                        }
                    );
                    uploadStream.end(image.buffer);
                })
            );

            const results = await Promise.all(uploadPromises);
            return results;
        } catch (error) {
            console.error('Failed to upload images:', error);
            throw error;
        }
    }
    async deleteImage(url: string): Promise<void> {
        try {
            const publicId = extractPublicIdFromUrl(url)
            console.log(publicId);
            
            const result = await cloudinary.uploader.destroy(publicId);
            console.log(result);
            

        } catch (error) {
            throw error;
        }
    }
}

export default new CloudinaryService();
