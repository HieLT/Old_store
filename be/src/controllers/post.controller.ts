import { Request, Response } from 'express';
import ProductRepo from '../repositories/product.repository';
import PostRepo from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';


interface CustomRequest extends Request {
    account?: any;
}

class PostController {
    async createPost(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;
            const dataInput = req.body;

            if (!dataInput.product || typeof dataInput.product !== 'object') {
                res.status(400).send('Dữ liệu sản phẩm phải là object');
                return;
            }

            const { name, attributes, condition, images, categoryId, description, price } = dataInput.product || {};

            let createdProduct;
            createdProduct = await ProductRepo.createProduct(
                dataInput.isDraft,
                {
                    name, description, price, condition, images, 
                    category_id : categoryId
                },
                attributes
            );


            let result;
            if (createdProduct) {
                result = await PostRepo.createPost(
                    dataInput.isDraft,
                {
                    poster_id: user._id,
                    product_id: createdProduct._id,
                    location: dataInput.location,
                    status: dataInput.isDraft ? "Draft" : "Pending"
                });
            }

            result ? res.status(400).send('Tạo mới thất bại') : res.status(200).send('Tạo mới thành công');
        } catch (err: any) {
            res.status(400).send(err.message);
        }
    }


    async imagesUpload(req: Request, res: Response): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                res.status(400).send('Không có ảnh');
                return;
            }
            const uploadImages = files.map(file => {
                return {
                    buffer: file.buffer,
                };
            });
            const uploadResults = await CloudinaryService.uploadImages(uploadImages, 'old_store/product');
            res.status(201).send(uploadResults);
        } catch (err: any) {
            res.status(400).send(err.message);
        }

    }
    async getOwnPost(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;

            const result = PostRepo.getPost(user._id);

            res.status(200).send(result);
        } catch (err: any) {
            res.status(400).send(err.message)
        }
    }
    async updatePost(postId: string, req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;
            const update = req.body

            const { name, attributes, condition, images, category_id, description, price } = update.product || {};

            // case from darft to normal ( pending status)
            let createdProduct;
            if (!update.toPending) {
                createdProduct = await ProductRepo.createProduct(
                    {
                        name, description, price, condition, images, category_id
                    },
                    attributes
                );
            }
            // case normal update
            else {

            }
        }
        } catch {
            res.status(500);
        }
    }

}




export default new PostController();
