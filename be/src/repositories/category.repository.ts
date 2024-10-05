import Category, { ICategory } from "../models/category";

class CategoryRepo {
    async getAllCategory():Promise<boolean>{
        try {
            const result = await Category.find();

            return result ? true : false ;
        } catch(err) {
            throw err;
        }
    }
    
    async getCategoryById(categoryId:string): Promise<ICategory | null> {
        try{
            const result = await Category.findById(categoryId);
            return result;
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
    async deleteCategory(categoryId: string) :Promise<boolean> {
        try{
            const result = await Category.findOneAndUpdate({_id : categoryId}, {is_deleted : true });

            return result ? true : false;
        } catch(err) {
            throw err;
        }
    }
    async restoreCategory(categoryId: string): Promise<boolean> {
        try{
            const result = await Category.findOneAndUpdate({_id : categoryId}, {is_deleted : false });

            return result ? true : false;
        } catch(err) {
            throw err;
        }
    }
}
export default new CategoryRepo();