import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary';
import UserRepo from "../repositories/user.repository";
import validatePassword from '../utils/validatePassword';
import { IUser } from '../models/user';

// interface MulterRequest extends Request {
//     file: Express.Multer.File;
// }
interface CustomRequest extends Request {
    account?: any;
}

class UserController {
    async getProfile(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account as IUser;
            const { password: _, ...userDetails } = user;
            res.status(200).send(user);
        } catch {
            res.status(500);
        }
    }

    async searchUser(req: Request, res: Response): Promise<void> {
        try {
            const { searchKey, page, limit } = req.body;
            const users = await UserRepo.searchUser(searchKey, page, limit);
            res.status(200).send(users)
        } catch {
            res.status(500);
        }
    }

    async updateUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            const update = req.body;
            const user = req.account as IUser;

            if (update.password && !validatePassword(update.password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            if ('is_deleted' in update) {
                res.status(403).send('Không có quyền cập nhật');
                return;
            }

            const result = await UserRepo.updateUser(String(user._id), update);

            result ? res.status(200).send('Cập nhật user thành công')
                : res.status(400).send('Cập nhật thất bại');

        } catch (error) {
            res.status(500);
        }
    }

    async updateAvatar(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account as IUser;
            const file = req.file;
            if (!file) {
                res.status(400).send('Không có ảnh upload');
                return;
            }
            if (user.avatar) CloudinaryService.deleteImage(user.avatar);

            const uploadImage = { buffer: file.buffer };

            const uploadResults = await CloudinaryService.uploadImages(uploadImage, 'Old_store/user');
            const avatarUrl = uploadResults[0];
            await UserRepo.updateUser(String(user._id), { avatar: avatarUrl });
    
            res.status(200).send('Upload ảnh thành công');
        } catch {
            res.status(500);
        }
    }
}



export default new UserController;
