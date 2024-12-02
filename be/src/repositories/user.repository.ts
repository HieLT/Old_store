import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

const { ObjectId } = Types

class UserRepo {
    async getUserById(id: string): Promise<any> {
        try {
            return User.findOne({ _id: new ObjectId(id), is_deleted: false });
        }
        catch (err) {
            throw err;
        }
    }

    async getUserByEmail(email: any): Promise<any> {
        try {
            const user = await User.findOne({ email });
            return user;
        }
        catch (err) {
            throw err;
        }
    }

    async searchUser(
        searchKey: string,
        page: number = 1,
        limit: number = 10
    ): Promise<IUser[]> {
        try {
            const searchQuery = {
                $or: [
                    { firstname: { $regex: searchKey, $options: 'i' } },
                    { lastname: { $regex: searchKey, $options: 'i' } },
                ]
            }
            const users = await User
                .find(searchQuery)
                .skip((page - 1) * limit)
                .limit(limit) // Limit number of documents per page
                .exec();
            return users;
        } catch (err) {
            throw err;
        }
    }

    async createUser(user: Partial<IUser>): Promise<boolean> {
        try {
            const create: Partial<IUser> = { ...user };

            if (user.password) {
                create.password = bcrypt.hashSync(user.password, 10);
            }
            else {
                create.password = null;
            }

            const result = await User.create(create);

            return result ? true : false;
        } catch (err) {
            throw err;
        }
    }

    async updateUser(id: string, user: Partial<IUser>): Promise<boolean> {
        try {
            const update: Partial<IUser> = { ...user };

            if (user.password) update.password = bcrypt.hashSync(user.password, 10);


            const result = await User.findOneAndUpdate({ _id: id }, update);

            return result ? true : false;

        } catch (err) {
            throw err;
        }
    }

    async deleteUser(id: string): Promise<boolean> {
        try {
            const result = await User.findByIdAndUpdate({ _id: id }, { is_deleted: true });

            return result ? true : false;

        } catch (err) {
            throw err;
        }
    }

    async restoreUser(id: string): Promise<boolean> {
        try {
            const result = await User.findByIdAndUpdate({ _id: id }, { is_deleted: false });

            !!result;

        } catch (err) {
            throw err;
        }
    }
}
export default new UserRepo();