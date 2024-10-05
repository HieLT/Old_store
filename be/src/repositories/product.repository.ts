import Product, { IProduct } from '../models/product';
import CategoryRepo from '../repositories/category.repository';

const validateProduct = async (product: IProduct): Promise<boolean> => {
    // Check if category_id is provided
    if (!product.category_id) {
        // throw new Error('category_id is required.');
        return false;
    }

    const allowedAttributes = await getAllowedAttributesForCategory(String(product.category_id));

    if (product.attributes) {
        const attributeKeys = Array.from(product.attributes.keys()); 
        const invalidAttributes = attributeKeys.filter(attr => !allowedAttributes.includes(attr));
        if (invalidAttributes.length > 0) {
            // throw new Error(`Invalid attributes: ${invalidAttributes.join(', ')}`);
            return false;
        }
    }
    
    return true ;
};

const getAllowedAttributesForCategory = async (categoryId: string): Promise<string[]> => {
    try {
        const category = await CategoryRepo.getCategoryById(categoryId); 
        return category?.attributes || []; 
    } catch (err) {
        throw new Error('Failed to fetch category attributes');
    }
};

class ProductRepo {
    async createProduct(product: IProduct): Promise<IProduct | false> {
        try {
            const validate = await validateProduct(product); 
            if( validate === false) return false; 
            const result = await Product.create(product);
            return result || false;
        } catch (err) {
            throw err;
        }
    }

    async updateProduct(productId: string, product: IProduct): Promise<boolean | false> {
        try {
            const validate = await validateProduct(product); 
            if( validate === false) return false; 
            const result = await Product.findByIdAndUpdate(productId, product);
            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }
}

export default new ProductRepo();
