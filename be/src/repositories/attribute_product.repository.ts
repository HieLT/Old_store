import AttributeProduct, { IAttributeProduct } from "../models/attribute_product";
import {ClientSession, Types} from 'mongoose';

const {ObjectId} = Types

class AttributeProductRepo {
    async getAttributeProduct(attributeProductId: string) {
        try {
            return AttributeProduct.findOne({_id: new ObjectId(attributeProductId), is_deleted: false})
        } catch (err) {
            throw err
        }
    }

    async getAllAttributesProduct(productId: string) {
        try {
            return AttributeProduct.find({product_id: new ObjectId(productId), is_deleted: false})
        } catch (err) {
            throw err
        }
    }

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
        productAttribute: {
            id: string;
            productId: string;
            attributeId: string;
            value: any;
        },
        session: ClientSession
    ): Promise<boolean> {
        try {
            const updateOrCreate = {
                product_id : productAttribute.productId,
                attribute_id : productAttribute.attributeId,
                value: productAttribute.value
            }
            const result = await AttributeProduct.findOneAndUpdate(
                { _id: productAttribute.id },
                updateOrCreate,
                {
                    session,
                    runValidators: !isDraft,
                    upsert: true, // Create if not found
                    setDefaultsOnInsert: true, // Apply default values if creating
                }
            );
            return !!result;
        } catch (err) {
            throw err;
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
