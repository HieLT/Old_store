import { Request, Response } from 'express';
import ProductRepo from '../repositories/product.repository';
import PostRepo from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';
import { Schema } from 'mongoose';

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}

interface CustomRequest extends Request {
    account?: any;
}

class PostController {
    async createPost(req: CustomRequest, res: Response): Promise<void> {
        try {
            const multerReq = req as MulterRequest;
            const create = req.body;
            const user = req.account;
            const files = multerReq.files
            let productId: Schema.Types.ObjectId | null = null;
            // if draft_product is null,... or empty object mean create new Product
            if (!create.draft_product || create.draft_product === {}) {
                const {name, attributes, images, condition, category} = create.product
                const uploadImages = files.map(file => {
                    return {
                        buffer: file.buffer,
                    };
                });
                CloudinaryService.uploadImages(uploadImages, 'Old_store/product')
                const createdProduct = await ProductRepo.createProduct(create.product);

                if (createdProduct) {
                    productId = createdProduct._id;
                } else {
                    res.status(400).send('Tạo mới product thất bại');
                    return;
                }
            }

            const result = await PostRepo.createPost({
                poster_id: user._id,
                product_id: productId,
                location: create.location,
                status: productId ? 'Pending' : 'Draft',
                draft_product: create.draft_product || null,
            });

            result ? res.status(400).send('Tạo mới thất bại') : res.status(200).send('Tạo mới thành công');
        } catch (error) {
            res.status(500);
        }
    }

    async updatePost(postId: string, req: CustomRequest, res: Response): Promise<void> {
        try {
            
        } catch {
            res.status(500);
        }
    }

}




export default new PostController();
