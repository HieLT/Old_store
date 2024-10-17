import  AttributeProduct, {IAttributeProduct} from "../models/attribute_product";
import { ClientSession } from 'mongoose'; 

class AttributeProductRepo {
    async createAttributeProduct(
        attribute_product: Partial<IAttributeProduct>, 
        session?: ClientSession
    ): Promise<boolean> {
        try {
            const create: Partial<IAttributeProduct>[] =  [{ ...attribute_product }] ; 
    
            const options = session ? { session } : {}; // Only include session if it exists
    
            const result = await AttributeProduct.create(create, options);
    
            return result ? true : false;
        } catch (error) {
            return false; 
        }
    }
    
    async updateAttributeProduct(id: string, baby: Partial<IAttributeProduct>): Promise<boolean> {
        try {
            const update : Partial<IAttributeProduct> = {...baby};

            const result =  await AttributeProduct.findOneAndUpdate({ _id: id }, update, { runValidators: true });
            
            return result ? true : false;
            
        } catch {
            return false;
        }
    }
    async deleteAttributeProduct(id: String) : Promise<boolean> {
        try {
            const result = await AttributeProduct.findByIdAndDelete(id);

            return result ? true : false ;
            
        } catch {
            return false;
        }
    }
}

export default new AttributeProductRepo();