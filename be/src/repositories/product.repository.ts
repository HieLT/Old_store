import Product, { IProduct } from '../models/product';
import AttributeRepo from './attribute.repository';
import AttributeProductRepo from './attribute_product.repository';
import { IAttribute } from '../models/attribute';
import mongoose, { ClientSession } from 'mongoose';



class ProductRepo {
    async getProduct(productId: string): Promise<any> {
        const result = await Product.findById(productId);

        return result;
    }
    async createProduct(
        isValidate: boolean,
        product: any,
        session: ClientSession,
    ): Promise<any> {
        try {
            // Create the main product first and get its _id
            const newProduct = new Product(product);

            const createdProduct = await newProduct.save({ session, validateBeforeSave: isValidate });
            
            return  createdProduct ? createdProduct : false;

        } catch (err) {
            throw err;
        } 
    }
    // async updateProduct(
    //     isDraft: boolean,
    //     product: any,
    //     productAttributes: {
    //         id: string,
    //         attributeId: string,
    //         value: any
    //     }[]
    // ): Promise<any> {
    //     const session = await mongoose.startSession(); // Start a session
    //     session.startTransaction(); // Start a transaction

    //     try {
    //         const updatedProduct = await Product.findOneAndUpdate({ _id: product._id }, product, { session, runValidator: !isDraft });

    //         if (!updatedProduct) {
    //             await session.abortTransaction();
    //             throw new Error('Cập nhật product thất bại');
    //         }

    //         if (!isDraft) {
    //             const missingAttributes = await isContainAllAttributeRequired(productAttributes, product.category_id)

    //             const missingLabels = missingAttributes.map((attr: IAttribute) => attr.label);

    //             if (missingLabels.length > 0) {
    //                 await session.abortTransaction(); // Rollback the transaction if required attributes are missing

    //                 throw new Error(`Thiếu các thuộc tính bắt buộc: ${missingLabels.join(', ')}`);
    //             }
    //         }

    //         const updationPromises = productAttributes.map((attribute: any) =>
    //             AttributeProductRepo.updateAttributeProduct(
    //                 isDraft,
    //                 { ...attribute, productId: product._id },
    //                 session)
    //         );

    //         const results = await Promise.all(updationPromises);
    //         if (results.includes(false)) {
    //             await session.abortTransaction();
    //         }

    //         await session.commitTransaction();
    //         return results;

    //     } catch (err) {
    //         throw err;
    //     }
    // }
}

export default new ProductRepo();
