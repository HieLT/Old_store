import Product, { IProduct } from '../models/product';
import AttributeRepo from './attribute.repository';
import AttributeProductRepo from './attribute_product.repository';
import { IAttribute } from '../models/attribute';
import mongoose, { ObjectId } from 'mongoose';



class ProductRepo {
    async createProduct(
        product: any,
        productAttributes: {
            id: string,
            productId: ObjectId,
            attributeId: ObjectId,
            value: any
        }[]
    ): Promise<any> {
        const session = await mongoose.startSession(); // Start a session
        session.startTransaction(); // Start a transaction

        try {
            // Create the main product first and get its _id
            const result= await Product.create(product, { session });

            if (!result) {
                await session.abortTransaction(); // Rollback if product creation fails
                return false;
            }

            const productId = result[0]._id;

            // Check if all required attributes are present
            const getAttributesRequired = await AttributeRepo.getAttributesRequired(String(product.category_id));
            const idAttributesRequired = getAttributesRequired.map((item: IAttribute) => item._id);
            const idAttributeInput = productAttributes.map(item => item.id);

            const allRequiredAttributeAreIncluded = idAttributesRequired.every((id: string) => idAttributeInput.includes(id));
            if (!allRequiredAttributeAreIncluded) {
                await session.abortTransaction(); // Rollback the transaction if required attributes are missing
                return false;
            }

            // Update productAttributes to include the productId for each attribute
            const updatedAttributes = productAttributes.map(attribute => ({
                ...attribute,
                productId 
            }));

            // Create each attribute product concurrently
            const creationPromises = updatedAttributes.map(attribute =>
                AttributeProductRepo.createAttributeProduct(attribute, session) 
            );

            const results = await Promise.all(creationPromises);

 
            if (results.includes(false)) {
                await session.abortTransaction();
                return false;
            }

            await session.commitTransaction(); 
            return result;
        } catch (err) {
            await session.abortTransaction(); 
            throw err; 
        } finally {
            session.endSession(); 
        }
    }


    async updateProduct(productId: string, product: IProduct): Promise<boolean | false> {
        try {
            const validate = await validateProduct(product);
            if (validate === false) return false;
            const result = await Product.findByIdAndUpdate(productId, product);
            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }
}

export default new ProductRepo();
