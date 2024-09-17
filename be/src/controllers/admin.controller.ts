import path from 'path'; 
import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary'; 
import UserRepo from "../repositories/user.repository";
import validatePassword from '../utils/validatePassword';

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}
interface CustomRequest extends Request {
    account?: any; 
}

class UserController {
    async updateAdmin(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const admin = req.account as IUser;

            if (user.password && !validatePassword(user.password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const result = await UserRepo.updateUser(user.email, data);

            result ? res.status(200).send('Cập nhật thành công') : res.status(400).send('Cập nhật thất bại');
            
        } catch (error) {
            res.status(500).send();
        }
    }

    async updateAvatar(req: Request, res: Response): Promise<void> {
        const multerReq = req as MulterRequest;
        const user = req.user as IUser;
        const files = multerReq.files ;
    
        if (files.length > 0) {
            const oldUrl = user.avatar;
            if (oldUrl) CloudinaryService.deleteImage(oldUrl);

            const images = files.map(file => {
                const baseName = path.basename(file.originalname, path.extname(file.originalname));
                return {
                    buffer: file.buffer,
                    originalname: baseName 
                };
            });
    
            CloudinaryService.uploadImages(images, 'Old_store/user').then(uploadResults => {
                const avatarUrl = uploadResults[0];
                UserRepo.updateUser(user.email, { avatar: avatarUrl }).catch(error => {
                    console.error(error);
                });
            }).catch(error => {
                console.error(error);
            });
    
            res.status(200).send('Cập nhật thành công, đang xử lý ảnh...');
        } else {
            res.status(500).send('Không có ảnh upload');
        }
    }
    
}

export default new UserController;
