import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";

class UserRepo {
    async getUserByEmail(email : any) : Promise<any> {
        try {
            const user = await User.findOne({email});
            return user;
        }
        catch (err){
            throw err
        }
    } 
    async createUser(user: Partial<IUser>): Promise<boolean> {
        try {     
            const create : Partial<IUser> = { ...user }; 

            if (user.password) {
                create.password = bcrypt.hashSync(user.password, 10);
            }
            else {
                create.password = null
            }

            const result = await User.create(create);

            return result ? true : false ;
        } catch (err) {
            throw new Error(`Failed to create user: ${err}`);
        }
    }
    

    async updateUser(email: string, user: Partial<IUser>): Promise<boolean> {
        try {
            const update : Partial<IUser> = {...user};

            if(user.password){
                update.password = bcrypt.hashSync(user.password, 10);
            }
    
            const result =  await User.findOneAndUpdate({ email }, update);

            return result ? true : false ;
            
        } catch (err) {
            throw err;
        }
    }
    async deleteUser(email : string): Promise<boolean> {
        try {
            const result = await User.findByIdAndUpdate({email} ,  {is_deleted : true});

            return result ? true : false ;
            
        } catch(err) {
            throw err
        }
    }
}
export default new UserRepo();