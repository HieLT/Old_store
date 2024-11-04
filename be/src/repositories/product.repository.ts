import Product, { IProduct } from '../models/product';
import AttributeRepo from './attribute.repository';
import AttributeProductRepo from './attribute_product.repository';
import { IAttribute } from '../models/attribute';
import mongoose, { ClientSession } from 'mongoose';
import { partial } from 'lodash';



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
    async updateProduct(
        isValidate: boolean,
        id : string,
        product : any,
        session: ClientSession
    ): Promise<any> {
        try{
            const update : Partial<IProduct>  = {...product};

            const result = await Product.findOneAndUpdate({_id : id} , update , {runValidators: isValidate});

            return result ? result : false;

        } catch (err) {
            throw err;
        }
    }
}

export default new ProductRepo();
