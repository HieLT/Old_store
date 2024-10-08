import { Request, Response } from "express";
import BabyRepo from '../repositories/baby.repository';
import { IUser } from '../models/user';
import { IBaby } from "../models/baby";


interface CustomRequest extends Request {
    account?: any;
}

class BabyController {
    async getBabies(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account as IUser;

            const babies = await BabyRepo.getBabies(String(user._id));

            res.status(200).send(babies);
        } catch {
            res.status(500);
        }
    }

    async createBaby(req: CustomRequest, res: Response): Promise<void> {
        try {
            const user = req.account as IUser;

            const create = req.body as IBaby;
            create.parent_id = user._id;

            try {
                await BabyRepo.createBaby(create);
                res.status(201).send('Tạo mới thành công');
            } 
            catch (err: any) {
                const message = Object.values(err.errors).map((e: any) => {
                    if (e.name === 'CastError') return 'Ngày sinh không hợp lệ';
                    else return e.message;
                });
                res.status(400).send(message);
            }
        } catch {
            res.status(500);
        }

    }
    async updateBaby(req: CustomRequest, res: Response): Promise<void> {
        try {
            const { babyId } = req.body;
            const update = req.body as IBaby;
            const user = req.account as IUser;

            const baby = await BabyRepo.getBaby(babyId);
            if (baby?.parent_id !== user._id) res.status(403).send('Không có quyền sửa đổi');
            else {
                try {
                    const result = await BabyRepo.updateBaby(babyId, update);
                    if(result) res.status(200).send('Cập nhật thành công');
                    else res.status(400).send('Không tìm thấy babyId');
                } 
                catch (err: any) {
                    const message = Object.values(err.errors).map((e: any) => {
                        if (e.name === 'CastError') return 'Ngày sinh không hợp lệ';
                        else return e.message;
                    });
                    res.status(400).send(message);
                }
            }
        } catch (error) {
            res.status(500);
        }
    }

    async deleteBaby(req: CustomRequest, res: Response): Promise<void> {
        try{
            const { babyId } = req.body;
            const user = req.account as IUser;

            const baby = await BabyRepo.getBaby(babyId);
            if (baby?.parent_id !== user._id) res.status(403).send('Không có quyền xóa');
            else {
                const result = await BabyRepo.deleteBaby(babyId);
                if (result) res.status(200).send('Xóa thành công');
                else res.status(400).send('Không tìm thấy babyId');
            }
        } catch{
            res.status(500);
        }
    }
}



export default new BabyController;
