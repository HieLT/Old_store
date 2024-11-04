import AttributeProduct, { IAttributeProduct } from "../models/attribute_product";
import { ClientSession } from 'mongoose';

class AttributeProductRepo {
    async getAttributeProduct(product_id: string): Promise<any> {
        try{
            const results = await AttributeProduct.find({product_id});
            return results;
        }catch(err){
            throw err;
        }
    }
    async createAttributeProduct(
        isValidate: boolean,
        attributeProduct: Partial<IAttributeProduct>,
        session: ClientSession
    ): Promise<boolean> {
        try {
            const newAttributeProduct = new AttributeProduct(attributeProduct);
            const result = await newAttributeProduct.save({ session, validateBeforeSave:isValidate});
            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }

    async updateAttributeProduct(
        isValidate: boolean,
        productAttributes: {
            id: string;
            product_id: string;
            attribute_id: string;
            value: any;
        },
        session: ClientSession
    ): Promise<boolean> {
        try {
            const updateOrCreate = {
                product_id : productAttributes.product_id,
                attribute_id : productAttributes.attribute_id,
                value: productAttributes.value
            }
            const result = await AttributeProduct.findOneAndUpdate(
                { _id: productAttributes.id },
                updateOrCreate,
                {
                    session,
                    runValidators: isValidate,
                    upsert: true, // Create if not found
                    setDefaultsOnInsert: true, // Apply default values if creating
                }
            );
            return result ? true : false;
        } catch (err){
            throw err;
        }
    }

    async deleteAttributeProduct(id: string): Promise<boolean> {
        try {
            const result = await AttributeProduct.findByIdAndUpdate(id , {is_deleted : true})
            return result ? true : false;
        } catch (err) {
            throw err ;
        }
    }

    async restoreAttributeProduct(id: string): Promise<boolean> {
        try {
            const result = await AttributeProduct.findByIdAndUpdate(id , {is_deleted : false})
            return result ? true : false;
        } catch (err) {
            throw err ;
        }
    }
}

export default new AttributeProductRepo();
