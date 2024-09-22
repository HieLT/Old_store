import path from 'path'; 
import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary'; 
import UserRepo from "../repositories/user.repository";
import validatePassword from '../utils/validatePassword';
import { IUser } from '../models/user';

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}
interface CustomRequest extends Request {
    account?: any; 
}

class UserController {
    async updateUser(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data = req.body;
            const user = req.account as IUser;
            console.log(user);
            

            if (user.password && !validatePassword(user.password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const result = await UserRepo.updateUser(String(user._id), data);

            result ? res.status(200).send('Cập nhật user thành công') 
            : res.status(400).send('Cập nhật thất bại');
            
        } catch (error) {
            res.status(500);
        }
    }

    async updateAvatar(req: CustomRequest, res: Response): Promise<void> {
        try{
            const multerReq = req as MulterRequest;
            const user = req.account as IUser;
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
                    UserRepo.updateUser(String(user._id), { avatar: avatarUrl }).catch(error => {
                        console.error(error);
                    });
                }).catch(error => {
                    console.error(error);
                });
        
                res.status(200).send('Upload ảnh thành công');
            } else {
                res.status(400).send('Không có ảnh upload');
            }
        } catch {
            res.status(500);
        }
    }
    
}

export default new UserController;
