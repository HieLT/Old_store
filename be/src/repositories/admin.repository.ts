import Admin, { IAdmin } from "../models/admin";
import bcrypt from "bcrypt";

class AdminRepo {
    async getAdminByEmail(email : any) : Promise<any> {
        try {
            const admin = await Admin.findOne({email});
            return admin;
        }
        catch (err){
            throw err
        }
    } 
    async createAdmin(admin: Partial<IAdmin>): Promise<boolean> {
        try {     
            const create : Partial<IAdmin> = { ...admin }; 

            create.password = bcrypt.hashSync(admin.password!, 10);
            create.role = 'admin';
            
            const result = await Admin.create(create);

            return result ? true : false ;
        } catch (err) {
            throw new Error(`Failed to create Admin: ${err}`);
        }
    }
    

    async updateAdmin(email: string, admin: Partial<IAdmin>): Promise<boolean> {
        try {
            const update : Partial<IAdmin> = {...admin};

            update.password = bcrypt.hashSync(admin.password!, 10);
            
            const result = await Admin.findOneAndUpdate({ email }, update);

            return result ? true : false ;
            
        } catch (err) {
            throw err;
        }
    }
    
}
export default new AdminRepo();