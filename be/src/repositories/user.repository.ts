import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import validatePassword from "../utils/validatePassword";
import validateEmail from "email-validator";

class UserRepo {
    async createUser(email:string, password:string, firstname:string, lastname:string) : Promise<boolean> {
        try{
            if (!validatePassword(password) || !validateEmail.validate(email)) return false;

            const hashPassword = bcrypt.hashSync(password.toString(), 10);
            await User.create({
                email,
                password: hashPassword,
                firstname,
                lastname
            });

            return true;
        }
        catch(err){
            throw err
        }

    }

    async updateUser(email)
}
export default new UserRepo();