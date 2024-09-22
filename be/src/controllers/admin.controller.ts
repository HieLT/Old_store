import path from 'path'; 
import { Request, Response } from "express";
import CloudinaryService from '../services/cloudinary'; 
import AdminRepo from '../repositories/admin.repository';
import UserRepo from '../repositories/user.repository';
import validatePassword from '../utils/validatePassword';
import validateEmail from "email-validator";
import { IAdmin } from '../models/admin';

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}
interface CustomRequest extends Request {
    account?: any; 
}


class AdminController {
    async getProfile(req: CustomRequest, res: Response) :Promise<void> {
        try{
            const admin = req.account as IAdmin;
            res.status(200).send({admin});
        } catch{
            res.status(500);
        }
    }
    async searchAdmin(req: Request, res: Response): Promise<void> {
        try{
            const{ searchKey, page , limit } = req.body;
            const admins = await AdminRepo.searchAdmin(searchKey,page,limit) ;
            res.status(200).send({admins})
        } catch {
            res.status(500);
        }
    }
    async updateAdmin(req: CustomRequest, res: Response): Promise<void> {
        try {
            const data = req.body;
            const admin = req.account;
            if (admin.password && !validatePassword(admin.password)) {
                res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
                return;
            }

            const result = await AdminRepo.updateAdmin(admin._id, data);

            result ? res.status(200).send('Cập nhật thành công') : res.status(400).send('Cập nhật thất bại');
            
        } catch {
            res.status(500);
        }
    }

    async updateAvatar(req: CustomRequest, res: Response): Promise<void> {
        try{
            const multerReq = req as MulterRequest;
            const admin = req.account;
            const files = multerReq.files ;
        
            if (files.length > 0) {
                const oldUrl = admin.avatar;
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
                    AdminRepo.updateAdmin(admin._id, { avatar: avatarUrl }).catch(error => {
                        console.error(error);
                    });
                }).catch(error => {
                    console.error(error);
                });
         
                res.status(200).send('Cập nhật thành công, đang xử lý ảnh...');
            } else {
                res.status(400).send('Không có ảnh upload');
            }
        }catch {
            res.status(500);
        }
        
    }
    async createAdmin(req:Request, res:Response) :Promise<void> {
        try{
            const newAdmin = req.body;

        if(!newAdmin.email || !validateEmail.validate(newAdmin.email)){
            res.status(400).send('Email không đáp ứng yêu cầu');
            return;
        }

        if(!newAdmin.password || !validatePassword(newAdmin.password)){
            res.status(400).send('Mật khẩu không đáp ứng yêu cầu');
            return;
        }

        const adminExisted = await AdminRepo.getAdminByEmail(newAdmin.email);

        if (adminExisted.Existed) {
            res.status(400).send('Người dùng đã tồn tại');
            return;
        }

        const result = await AdminRepo.createAdmin(newAdmin);
        result ? res.status(201).send('Thêm mới admin thành công') 
        : res.status(400).send('Tạo mới admin không thành công');
        } catch{
            res.status(500)
        } 
    }
    async deleteAdmin(req: Request, res: Response) : Promise<void> {
        try{
            const emailAdminDelete = req.body.emailAdminDelete;
            if (!validateEmail.validate(emailAdminDelete)) {
                res.status(400).send('Email không hợp lệ');
                return;
            }
            const result = await AdminRepo.deleteAdmin(emailAdminDelete);
            result ? res.status(200) : res.status(400).send('Xóa tài khoản không thành công');
        } catch{
            res.send(500)
        }
    }
    async deleteUser(req: Request, res: Response): Promise<void> {
        try{
            const emailUserDelete = req.body.emailUserDelete;

            if (!validateEmail.validate(emailUserDelete)) {
                res.status(400).send('Email không hợp lệ');
                return;
            }

            const result = await UserRepo.deleteUser(emailUserDelete);
            result ? res.status(200) : res.status(400).send('Xóa tài khoản không thành công');
        }catch{
            res.send(500)
        }
    }
    
}

export default new AdminController;
