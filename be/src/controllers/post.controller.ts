import { Request, Response } from 'express';
import ProductRepo from '../repositories/product.repository';
import AttributeRepo from '../repositories/attribute.repository';
import AttributeProductRepo from '../repositories/attribute_product.repository';
import PostRepo from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';
import mongoose from 'mongoose';
import attribute, { IAttribute } from '../models/attribute';
import attribute_product, { IAttributeProduct } from '../models/attribute_product';

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
    async createPost(req: CustomRequest, res: Response): Promise<void> {
        const session = await mongoose.startSession(); // Start a session
        session.startTransaction(); // Start a transaction
        try {
            const user = req.account;
            const dataInput = req.body;

            const { title, location, is_draft } = dataInput;
            const { name, product_attributes, condition, images, category_id, description, price } = dataInput.product || {};

            const createdProduct = await ProductRepo.createProduct(
                !is_draft,
                {
                    name: name,
                    description: description,
                    price: price,
                    condition: condition,
                    images: images,
                    category_id: category_id
                },
                session
            );

            if (product_attributes || !is_draft) {

                if (!is_draft) {
                    if (!Array.isArray(product_attributes)) {
                        throw new Error('Thuộc tính product_attributes phải là một mảng chứa các đối tượng key-value.');
                    }

                    const missingAttributes = await getMissingAttributesRequired(product_attributes, category_id);

                    const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                    if (missingLabels.length > 0) {
                        throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                    }
                }

                // Update productAttributes to include the productId for each attribute before creeate product_attribute


                const updatedAttributes = product_attributes.map((attribute: IAttributeProduct) => ({
                    product_id: createdProduct._id,
                    attribute_id: attribute.attribute_id,
                    value: attribute.value
                }));

                // Create product attributes concurrently
                await Promise.all(
                    updatedAttributes.map((attribute: any) =>
                        AttributeProductRepo.createAttributeProduct(!is_draft, attribute, session)
                    )
                );


                // Add remaining attributes with null values
                const attributeLeft = await getAttributesLeft(product_attributes, category_id);
                const attributesLeftToCreate = attributeLeft.map((attribute: IAttributeProduct) => ({
                    product_id: createdProduct._id,
                    attribute_id: attribute._id,
                    value: null
                }));

                await Promise.all(attributesLeftToCreate.map((attribute: any) =>
                    AttributeProductRepo.createAttributeProduct(false, attribute, session)
                ));

            }

            const createdPost = await PostRepo.createPost(
                !is_draft,
                {
                    title: title,
                    poster_id: user._id,
                    product_id: createdProduct._id,
                    location: location,
                    status: is_draft ? "Draft" : "Pending"
                });

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
    async getOwnPost(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account;

            const result = PostRepo.getPost(user._id);

            res.status(200).send(result);
        } catch (err: any) {
            res.status(400).send(err.message)
        }
    }
    //     async updatePost(postId: string, req: CustomRequest, res: Response): Promise<void> {
    //         try {
    //             const user = req.account;
    //             const update = req.body

    //             const { postId, name, attributes, condition, images, category_id, description, price, status } = update.product || {};

    //             const post = await PostRepo.getPost(postId);
    //             if (post.poster_id !== user._id) {
    //                 res.status(403).send("Không có quyền thay đổi post này");
    //                 return;
    //             }

    //             const updatedProduct = await ProductRepo.updateProduct()


    //         }
    //         } catch {
    //     res.status(500);
    // }
    //     }

}




export default new PostController();
