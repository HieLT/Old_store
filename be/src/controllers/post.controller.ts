import { Request, Response } from 'express';
import ProductRepo from '../repositories/product.repository';
import AttributeRepo from '../repositories/attribute.repository';
import AttributeProductRepo from '../repositories/attribute_product.repository';
import PostRepo from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';
import mongoose from 'mongoose';
import { IAttribute } from '../models/attribute';
import { IAttributeProduct } from '../models/attribute_product';

interface CustomRequest extends Request {
    account?: any;
}

async function getMissingAttributesRequired(productAttributes: any[], categoryId: string): Promise<any> {
    const getAttributesRequired = await AttributeRepo.getAttributesRequired(categoryId);

    const idAttributeInput = productAttributes.map(item => item.attribute_id);

    const missingAttributes = getAttributesRequired.filter((attribute: IAttribute) =>
        !idAttributeInput.includes(attribute._id.toString())
    );

    return missingAttributes;
}

async function getAttributesLeft(productAttributes: any[], categoryId: string): Promise<any> {
    const allAttributes = await AttributeRepo.getAttributes(categoryId);

    const attributeIds = allAttributes.map((item: IAttribute) => item._id);

    const idAttributeInput = productAttributes.map(item => item.attribute_id);

    const attributesLeft = attributeIds.filter((item: any) => !idAttributeInput.includes(item.attribute_id));

    return attributesLeft;

}

class PostController {
    async getOwnPosts (req: CustomRequest, res: Response): Promise<void> {
        const user = req.account;
        const { 
            keywords = '', 
            page = 1, 
            status = '',
            limit = 10
        }: { 
            keywords?: string; 
            page?: number; 
            status?: string;
            limit?: number; 
        } = req.query;
        try{
          
            const post = await PostRepo.getPosts(user._id, keywords, status, page , limit);

            res.status(200).send(post);

        } catch(err: any) {
            res.status(400).send(err.message);
        }
    }
    async createPost(req: CustomRequest, res: Response): Promise<void> {
        const session = await mongoose.startSession(); // Start a session
        session.startTransaction(); // Start a transaction
        try {
            const user = req.account;
            const dataInput = req.body;

            const { post, product, is_draft } = dataInput;
            const { product_attributes, product_only } = product;

            const createdProduct = await ProductRepo.createProduct(
                !is_draft,
                product_only,
                session
            );

            // Create required product_attributes
            let mapped_attributes;
            try {
                mapped_attributes = product_attributes.map((attribute: IAttributeProduct) => ({
                    product_id: createdProduct._id,
                    attribute_id: attribute.attribute_id,
                    value: attribute.value
                }));
            } catch {
                throw new Error('Thuộc tính product_attributes phải là một mảng chứa các đối tượng key-value.');
            }


            await Promise.all(
                mapped_attributes.map((attribute: any) =>
                    AttributeProductRepo.createAttributeProduct(true, attribute, session)
                )
            );


            // Create remaining product_attributes with value is null
            const attributeLeft = await getAttributesLeft(product_attributes, product.category_id);
            const attributesLeftToCreate = attributeLeft.map((attribute: IAttributeProduct) => ({
                product_id: createdProduct._id,
                attribute_id: attribute._id,
                value: null
            }));

            await Promise.all(attributesLeftToCreate.map((attribute: any) =>
                AttributeProductRepo.createAttributeProduct(!is_draft, attribute, session)
            ));

            // Check required product_attributes 
            if (!is_draft) {
                const getAttributeProduct = await AttributeProductRepo.getAttributeProduct(createdProduct._id);

                const missingAttributes = await getMissingAttributesRequired(getAttributeProduct, product.category_id);

                const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                if (missingLabels.length > 0) {
                    throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                }
            }


            const createdPost = await PostRepo.createPost(
                !is_draft,
                {
                    ...post,
                    poster_id: user._id,
                    product_id: createdProduct._id,
                    status: is_draft ? "Draft" : "Pending"
                },
                session
            );

            await session.commitTransaction();

            res.status(200).send('Tạo mới thành công');
        } catch (err: any) {
            await session.abortTransaction();
            res.status(400).send(err.message);
        } finally {
            session.endSession();
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
    async changeVisibility(req: CustomRequest, res: Response): Promise<any> {
        const user = req.account;
        const { is_visibility } : {is_visibility: boolean} = req.body.is_visibility;
        const { id } = req.params;
        try{
            const post = await PostRepo.getPost(id);
            if(!post) return res.status(404).send('Không có bài đăng');
            if(post.poster_id !== user._id) return res.status(403).send('Không có quyền thay đổi');
            

        } catch(err: any) {
            res.status(500).send(err.message)
        }
    }
}




export default new PostController();
