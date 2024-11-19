import {Request, Response} from 'express';
import ProductRepo from '../repositories/product.repository';
import productRepository from '../repositories/product.repository';
import AttributeRepo from '../repositories/attribute.repository';
import AttributeProductRepo from '../repositories/attribute_product.repository';
import PostRepo from '../repositories/post.repository';
import postRepository from '../repositories/post.repository';
import CloudinaryService from '../services/cloudinary';
import mongoose, {isValidObjectId} from 'mongoose';
import {IAttribute} from '../models/attribute';
import {IAttributeProduct} from '../models/attribute_product';
import {getDetailErrorMessage} from "../utils/helpers";
import {updatePostSchema} from "../requests/post.request";
import {POST_STATUS} from "../utils/enum";
import {DEFAULT_GET_QUERY} from "../utils/constants";

interface CustomRequest extends Request {
    account?: any;
}

async function getMissingAttributesRequired(productAttributes: any[], categoryId: string): Promise<any> {
    const requiredAttributes = await AttributeRepo.getAttributesRequired(categoryId);
    const requestAttributeIds = productAttributes?.map(item => item?.attribute_id)
    let missingCount: IAttribute[] = []

    requiredAttributes?.forEach((item: IAttribute) => {
        const existAttribute = requestAttributeIds?.find(id => id === item?._id)
        if (!existAttribute || !existAttribute?.value) {
            missingCount = [...missingCount, item]
        }
    })
    return missingCount
}

async function getAttributesLeft(productAttributes: any[], categoryId: string): Promise<any> {
    const allAttributes = await AttributeRepo.getAttributes(categoryId);

    const attributeIds = allAttributes.map((item: IAttribute) => item._id);

    const idAttributeInput = productAttributes.map(item => item.attribute_id);

    return attributeIds.filter((item: any) => !idAttributeInput?.includes(item.attribute_id));
}

const handleCheckObjectArrayType = (arr: any): void => {
    if (!Array.isArray(arr)) {
        throw new Error('Thuộc tính product_attributes phải là một mảng chứa các đối tượng key-value.');
    }
    if (arr?.length > 0) {
        arr.forEach((item: any) => {
            if (!('attribute_id' in item) || !('value' in item)) {
                throw new Error('Thuộc tính product_attributes phải là một mảng chứa các đối tượng key-value.')
            }
        })
    }
}

class PostController {
    async getPostById(req: CustomRequest, res: Response): Promise<any> {
        try {
            const postId: string = req.params.id
            const accountId = req.account?._id
            if (!postId || !isValidObjectId(postId)) {
                return res.status(400).send({message: 'ID bài đăng không hợp lệ'})
            }
            let post = await postRepository.getPost(postId)
            if (!post) {
                return res.status(404).send({message: 'Bài đăng không tồn tại hoặc đã bị xóa'})
            }
            const postProduct = await productRepository.getProduct(post?.product_id)
            post = {
                ...post,
                product: postProduct
            }
            return res.status(200).send({
                post: post,
                editable: String(accountId) === String(post?.poster_id)
            })
        } catch (err) {
            return res.status(500).send({message: 'Interval Server Error'})
        }
    }

    async createPost(req: CustomRequest, res: Response): Promise<void> {
        const session: mongoose.mongo.ClientSession = await mongoose.startSession();
        session.startTransaction();

        const user = req.account;
        const dataInput = req.body.post;
        const {title, location, is_draft} = dataInput;
        const {product_attributes, condition, images, category_id, description, price} = dataInput.product || {};

        if (!dataInput || !dataInput.product) {
            res.status(400).send('Lỗi yêu cầu')
            return
        }

        try {
            const createdProduct = await ProductRepo.createProduct(
                !is_draft,
                {
                    description: description,
                    price: price,
                    condition: condition,
                    images: images,
                    category_id: category_id
                },
                session
            );

            // check object array type
            handleCheckObjectArrayType(product_attributes)

            if (!is_draft) {
                const missingAttributes = await getMissingAttributesRequired(product_attributes, category_id);

                const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                if (missingLabels.length > 0) {
                    throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                }
            }

            // Update productAttributes to include the productId for each attribute before create product_attribute
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
            const attributeLeft = await getAttributesLeft(product_attributes ? product_attributes : [], category_id);
            const attributesLeftToCreate = attributeLeft.map((attribute: IAttributeProduct) => ({
                product_id: createdProduct._id,
                attribute_id: attribute._id,
                value: null
            }));

            await Promise.all(attributesLeftToCreate.map((attribute: any) =>
                AttributeProductRepo.createAttributeProduct(false, attribute, session)
            ));

            await PostRepo.createPost(
                !is_draft,
                {
                    title: title,
                    poster_id: user._id,
                    product_id: createdProduct._id,
                    location: location,
                    status: is_draft ? "draft" : "pending"
                });

            await session.commitTransaction();

            res.status(201).send('Tạo mới thành công');
        } catch (err: any) {
            await session.abortTransaction();
            if (images?.length > 0) {
                images?.forEach((imageUrl: string) => {
                    CloudinaryService.deleteImage(imageUrl)
                })
            }
            res.status(400).send(err.message);
        } finally {
            session.endSession();
        }
    }

    async imagesUpload(req: Request, res: Response): Promise<void> {
        try {
            const files = req.files as Express.Multer.File[];
            console.log(files)
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
            const status = req.query.status || POST_STATUS.APPROVED

            const result = await PostRepo.getAllMyPosts(user._id, status as string, {
                search: req.query.search as string || undefined,
                page: req.query.page as string,
                column: req.query.column as string || 'createdAt',
                sort_order: req.query.sort_order || DEFAULT_GET_QUERY.SORT_ORDER
            });

            res.status(200).send(result);
        } catch (err: any) {
            res.status(400).send(err.message)
        }
    }

    async updatePost(req: CustomRequest, res: Response): Promise<any> {
        const session: mongoose.mongo.ClientSession = await mongoose.startSession();
        session.startTransaction();

        const user = req.account;
        const requestPost = req.body.post;
        const {product_attributes, condition, images, category_id, description, price} = requestPost.product || {};

        const {error} = updatePostSchema.body.validate(
            requestPost, {abortEarly: false}
        )
        if (error) {
            return res.status(400).send({
                message: 'Lỗi yêu cầu',
                details: getDetailErrorMessage(error)
            })
        }
        const postId = req.params.id

        try {
            if (!isValidObjectId(postId)) {
                return res.status(400).send('ID bài đăng không hợp lệ')
            }

            const post = await PostRepo.getPost(postId);
            if (!post) {
                return res.status(404).send('Bài đăng không tồn tại hoặc đã bị xóa')
            }
            if (post.poster_id !== user._id) {
                return res.status(403).send("Bạn không có quyền chỉnh sửa bài đăng này");
            }

            // check request status
            let status = POST_STATUS.PENDING
            const currentStatus = post?.status
            const requestStatus = requestPost?.status
            if (
                requestStatus === POST_STATUS.PENDING &&
                (
                    currentStatus === POST_STATUS.DRAFT ||
                    currentStatus === POST_STATUS.APPROVED ||
                    currentStatus === POST_STATUS.REJECTED ||
                    currentStatus === POST_STATUS.PENDING
                )
            ) {
                status = POST_STATUS.PENDING
            } else if (requestStatus === POST_STATUS.DRAFT && currentStatus === POST_STATUS.DRAFT) {
                status = POST_STATUS.DRAFT
            } else {
                return res.status(403).send({message: 'Bạn không có quyền thay đổi trạng thái bài đăng'})
            }

            for (const item of product_attributes) {
                const attribute = await AttributeRepo.getAttribute(item?.attribute_id)
                if (!attribute) {
                    return res.status(404).send('Tồn tại ID thuộc tính không hợp lệ')
                }
            }

            if (requestStatus !== POST_STATUS.DRAFT) {
                const missingAttributes = await getMissingAttributesRequired(product_attributes, category_id);
                const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                if (missingLabels.length > 0) {
                    throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                }
            }

            const updateProductResult = await ProductRepo.updateProduct(
                requestStatus !== POST_STATUS.DRAFT,
                {
                    description: description,
                    price: price,
                    condition: condition,
                    images: images,
                    category_id: category_id
                },
                session
            );
            if (updateProductResult) {
                await Promise.all(product_attributes.map((item: {
                        _id: string,
                        attribute_id: string,
                        product_id: string,
                        value: any
                    }) =>
                        AttributeProductRepo.updateAttributeProduct(
                            requestStatus !== POST_STATUS.DRAFT,
                            {
                                id: item?._id,
                                attributeId: item?.attribute_id,
                                productId: item?.product_id,
                                value: item?.value
                            }, session)
                ));

                await PostRepo.updatePost(postId, {
                    ...requestPost,
                    status
                })
            }

            await session.commitTransaction();

            res.status(200).send('Cập nhật thành công');
        } catch (err: any) {
            await session.abortTransaction();
            if (images?.length > 0) {
                images?.forEach((imageUrl: string) => {
                    CloudinaryService.deleteImage(imageUrl)
                })
            }
            res.status(400).send(err.message);
        } finally {
            session.endSession();
        }
    }
}


export default new PostController();
