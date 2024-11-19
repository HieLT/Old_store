import Product, {IProduct} from '../models/product';
import {ClientSession, Types} from 'mongoose';
import attributeProductRepository from "./attribute_product.repository";

const {ObjectId} = Types

class ProductRepo {
    async getProduct(productId: string): Promise<any> {
        try {
            let product: any = await Product.findOne({_id: new ObjectId(productId), is_deleted: false}).lean()
            if (!product) {
                return null
            }
            // @ts-ignore
            const productAttributes = await attributeProductRepository.getAllAttributesProduct(product?._id)
            product = {
                ...product,
                product_attributes: productAttributes ? productAttributes?.map(item => ({
                    _id: item?._id,
                    attribute_id: item?.attribute_id,
                    product_id: item?.product_id,
                    value: item?.value
                })) : []
            }
            return product
        } catch (err) {
            throw err
        }
    }

    async createProduct(
        isValidate: boolean,
        product: any,
        session: ClientSession,
    ): Promise<any> {
        try {
            // Create the main product first and get its _id
            const newProduct = new Product(product);

            const createdProduct = await newProduct.save({session, validateBeforeSave: isValidate});

            return createdProduct ? createdProduct : false;

        } catch (err) {
            throw err;
        }
    }

    async updateProduct(
        isValidate: boolean,
        product: any,
        session: ClientSession
    ): Promise<any> {
        try {
            const update: Partial<IProduct> = {...product};

            const result = await Product.findOneAndUpdate(
                {_id: product.id},
                update,
                {
                    session,
                    runValidators: isValidate
                });

            return result ? result : false;
        } catch (err) {
            throw err;
        }
    }
}

export default new ProductRepo();
