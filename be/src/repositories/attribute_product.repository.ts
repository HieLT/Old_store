import AttributeProduct, { IAttributeProduct } from "../models/attribute_product";
import { ClientSession } from 'mongoose';

class AttributeProductRepo {
    async createAttributeProduct(
        isValidate : boolean,
        attributeProduct: Partial<IAttributeProduct>,
        session: ClientSession
    ): Promise<boolean> {
        try {
            const newAttributeProduct = new AttributeProduct(attributeProduct);
            const result = await newAttributeProduct.save({ session, validateBeforeSave: isValidate});
            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }

    async updateAttributeProduct(
        isDraft: boolean,
        productAttributes: {
            id: string;
            productId: string;
            attributeId: string;
            value: any;
        },
        session: ClientSession
    ): Promise<boolean> {
        try {
            const updateOrCreate = {
                product_id : productAttributes.productId,
                attribute_id : productAttributes.attributeId,
                value: productAttributes.value
            }
            const result = await AttributeProduct.findOneAndUpdate(
                { _id: productAttributes.id },
                updateOrCreate,
                {
                    session,
                    runValidators: !isDraft,
                    upsert: true, // Create if not found
                    setDefaultsOnInsert: true, // Apply default values if creating
                }
            );
            return result ? true : false;
        } catch {
            return false;
        }
    }

    async deleteAttributeProduct(id: string): Promise<boolean> {
        try {
            const result = await AttributeProduct.findByIdAndDelete(id);
            return result ? true : false;
        } catch {
            return false;
        }
    }
}

export default new AttributeProductRepo();
