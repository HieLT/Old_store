import Category, { ICategory } from "../models/category";
import bcrypt from "bcrypt";

class AdminRepo {
    async getCategory():Promise<boolean>{
        try {
            const result = await Category.find();

            return result ? true : false ;
        } catch(err) {
            throw err;
        }
    }
    async createCategory(category: Partial<ICategory>): Promise<boolean> {
        try {     
            const create : Partial<ICategory> = { ...category }; 
            
            const result = await Category.create(create);

            return result ? true : false ;
        } catch (err) {
            throw err;
        }
    }
    
    async updateCategory( id: string, category: Partial<ICategory>): Promise<boolean> {
        try {
            const update : Partial<ICategory> = {...category};
            
            const result = await Category.findOneAndUpdate({_id : id}, update);

            return result ? true : false ;
            
        } catch (err) {
            throw err;
        }
    }
    async deleteCategory(id: string) :Promise<boolean> {
        try{
            const result = await Category.findOneAndUpdate({_id : id}, {is_deleted : true });

            return result ? true : false;
        } catch(err) {
            throw err;
        }
    }
    async restoreCategory(id: string): Promise<boolean> {
        try{
            const result = await Category.findOneAndUpdate({_id : id}, {is_deleted : false });

            return result ? true : false;
        } catch(err) {
            throw err;
        }
    }
}
export default new AdminRepo();