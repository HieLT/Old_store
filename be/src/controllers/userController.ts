import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary'; 
import UserRepo from "../repositories/user.repository";

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}

class UserController {
    async updateUser(req: Request , res: Response) : Promise<void> {
        try {
            const multerReq = req as MulterRequest;
            const files = multerReq.files;
            const data = req.body;
            const email = req.user as string;

            if (files) {
                const user = await UserRepo.getUserByEmail(email);
                const oldAvatar = user.avatar;
                if (oldAvatar) {
                    const publicId = `Old_store/user/${oldAvatar}`;
                    await CloudinaryService.deleteImage(publicId);
                }

                const images = files.map(file => ({
                    buffer: file.buffer,
                    originalname: file.originalname
                }));

                const uploadResult = await CloudinaryService.uploadImages(images, 'Old_store/user');
                
                data.avatar = images[0].originalname; 
            }
            const result = await UserRepo.updateUser(email, data);

            result ? res.status(200).send('Cập nhật thành công') : res.status(400).send('Cập nhật thất bại') 
            
        } catch (error) {
            res.status(500).send();
        }
    }
}

export default new UserController;
