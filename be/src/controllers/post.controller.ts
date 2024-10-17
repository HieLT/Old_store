import { Request, Response } from 'express';
import ProductRepo from '../repositories/product.repository';
import PostRepo from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';
import { Schema } from 'mongoose';
import attributeRepo from '../repositories/attribute.repository';

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
            const files = multerReq.files;
            const user = req.account;
            const dataInput = req.body;

            if (!dataInput.isDraft) {
                const { name, attributes, condition, categoryId, description, price } = dataInput.product
                const uploadImages = files.map(file => {
                    return {
                        buffer: file.buffer,
                    };
                });
                const uploadResults = await CloudinaryService.uploadImages(uploadImages, 'Old_store/product')
                const createdProduct = await ProductRepo.createProduct(
                    {
                        name, description, price, condition,
                        images: uploadResults,
                        category_id: categoryId
                    },
                    attributes
                );

                // if (createdProduct) {
                //     productId = createdProduct._id;
                // } else {
                //     res.status(400).send('Tạo mới product thất bại');
                //     return;
                // }
                const result = await PostRepo.createPost({
                    poster_id: user._id,
                    product_id: createdProduct._id,
                    location: dataInput.location,
                    status: dataInput.isDraft ? 'Draft' : 'Pending',
                    draft_product: dataInput.draft_product || null,
                });
                result ? res.status(400).send('Tạo mới thất bại') : res.status(200).send('Tạo mới thành công');
            }

            
        } catch (err) {
            res.status(500).send(err);
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
