import path from 'path'; // Import the path module
import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary'; 
import UserRepo from "../repositories/user.repository";
import { IUser } from "../models/user";

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}

class UserController {
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const multerReq = req as MulterRequest;
            const files = multerReq.files;
            const data = req.body;
            const user = req.user as IUser;

            if (files) {
                console.log('files');
                const oldAvatar = user.avatar;
                if (oldAvatar) {
                    const publicId = `Old_store/user/${oldAvatar}`;
                    await CloudinaryService.deleteImage(publicId);
                }

                const images = files.map(file => {
                    // Extract the base name without extension
                    const baseName = path.basename(file.originalname, path.extname(file.originalname));
                    return {
                        buffer: file.buffer,
                        originalname: baseName // Set only the base name
                    };
                });

                const uploadResult = await CloudinaryService.uploadImages(images, 'Old_store/user');
                
                // Set data.avatar to the base name of the first image
                data.avatar = images[0].originalname; 
            }
            
            const result = await UserRepo.updateUser(user.email, data);

            result ? res.status(200).send('Cập nhật thành công') : res.status(400).send('Cập nhật thất bại');
            
        } catch (error) {
            res.status(500).send();
        }
    }
}

export default new UserController;
