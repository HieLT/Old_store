import Admin, { IAdmin } from "../models/admin";
import bcrypt from "bcrypt";

class AdminRepo {
    async getAdminByEmail(email : any) : Promise<any> {
        try {
            const admin = await Admin.findOne({email});
            return Admin;
        }
        catch (err){
            throw err
        }
    } 
    async createAdmin(Admin: Partial<IAdmin>): Promise<boolean> {
        try {     
            const create : Partial<IAdmin> = { ...Admin }; 

            create.password = bcrypt.hashSync(Admin.password!, 10);
            
            const result = await Admin.create(create);

            return result ? true : false ;
        } catch (err) {
            throw new Error(`Failed to create Admin: ${err}`);
        }
    }
    

    async updateAdmin(email: string, Admin: Partial<IAdmin>): Promise<boolean> {
        try {
            const update : Partial<IAdmin> = {...Admin};

            if(Admin.password){
                update.password = bcrypt.hashSync(Admin.password, 10);
            }
    
            const result =  await Admin.findOneAndUpdate({ email }, update);

            return result ? true : false ;
            
        } catch (err) {
            throw err;
        }
    }
    
}
export default new AdminRepo();