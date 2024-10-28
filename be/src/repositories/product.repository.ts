import Product, { IProduct } from '../models/product';
import AttributeRepo from './attribute.repository';
import AttributeProductRepo from './attribute_product.repository';
import { IAttribute } from '../models/attribute';
import mongoose from 'mongoose';

async function isContainAllAttributeRequired(productAttributes: any[], categoryId: string): Promise<any> {
    const getAttributesRequired = await AttributeRepo.getAttributesRequired(categoryId);

    const idAttributeInput = productAttributes.map(item => item.attributeId);

    const missingAttributes = getAttributesRequired.filter((attribute: IAttribute) =>
        !idAttributeInput.includes(attribute._id.toString())
    );
    return missingAttributes;
}

class ProductRepo {
    async getProduct(productId: string): Promise<any> {
        const result = await Product.findById(productId);

        return result;
    }
    async createProduct(
        isDraft: boolean,
        product: any,
        productAttributes: {
            attributeId: string,
            value: any
        }[]
    ): Promise<any> {
        const session = await mongoose.startSession(); // Start a session
        session.startTransaction(); // Start a transaction

        try {
            // Create the main product first and get its _id
            const newProduct = new Product(product);

            const createdProduct = await newProduct.save({ session, validateBeforeSave: !isDraft });

            if (!createdProduct) {
                await session.abortTransaction(); // Rollback if product creation fails
                throw new Error('Tạo product thất bại');
            }

            const productId = createdProduct._id

            // Check if all required attributes are present if this is not daft post
            if (!isDraft) {
                const missingAttributes = await isContainAllAttributeRequired(productAttributes, product.category_id)

                const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                if (missingLabels.length > 0) {
                    await session.abortTransaction(); // Rollback the transaction if required attributes are missing

                    throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                }
            }

            // Update productAttributes to include the productId for each attribute before creeate product_attribute
            const updatedAttributes = productAttributes.map(attribute => ({
                product_id: productId,  // productId is now a string
                attribute_id: attribute.attributeId, // attributeId is now a string
                value: attribute.value
            }));

            // Create each attribute product concurrently
            const creationPromises = updatedAttributes.map((attribute: any) =>
                AttributeProductRepo.createAttributeProduct(attribute, session)
            );

            const results = await Promise.all(creationPromises);

            if (results.includes(false)) {
                await session.abortTransaction();
                return false;
            }

            await session.commitTransaction();
            return results;
        } catch (err) {
            throw err;
        } finally {
            session.endSession();
        }
    }
    async updateProduct(
        isDraft: boolean,
        product: any,
        productAttributes: {
            id: string,
            attributeId: string,
            value: any
        }[]
    ): Promise<any> {
        const session = await mongoose.startSession(); // Start a session
        session.startTransaction(); // Start a transaction

        try {
            const updatedProduct = await Product.findOneAndUpdate({ _id: product._id }, product, { session, runValidator: !isDraft });

            if (!updatedProduct) {
                await session.abortTransaction();
                throw new Error('Cập nhật product thất bại');
            }

            if (!isDraft) {
                const missingAttributes = await isContainAllAttributeRequired(productAttributes, product.category_id)

                const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

                if (missingLabels.length > 0) {
                    await session.abortTransaction(); // Rollback the transaction if required attributes are missing

                    throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
                }
            }

            const updationPromises = productAttributes.map((attribute: any) =>
                AttributeProductRepo.updateAttributeProduct(
                    isDraft,
                    { ...attribute, productId: product._id },
                    session)
            );

            const results = await Promise.all(updationPromises);
            if (results.includes(false)) {
                await session.abortTransaction();
                return false;
            }

            await session.commitTransaction();
            return results;

        } catch (err) {
            throw err;
        }
    }
}

export default new ProductRepo();
