import { Request, Response } from "express";
import CateRepo from '../repositories/category.repository';

interface ICategoryRequestBody {
    name: string;
    description?: string; 
    attributes: object;   
}

class CategoryController {
    async getCategory(req: Request, res: Response): Promise<void> {
            const result = await CateRepo.getCategory();

            result ? res.status(200).send(result)
            : res.status(500);
    }
    async createCategory(req: Request<{}, {}, ICategoryRequestBody>, res: Response): Promise<void> {
        try {

            const { name, description, attributes } = req.body;

            const result = await CateRepo.createCategory({ name, description, attributes });

            result ? res.status(201).send('Tạo mới category thành công')
            : res.status(400)
        } catch {
            res.status(500);
        }
    }
    async updateCategory(req: Request, res: Response): Promise<void> {
        try{
            const { id } = req.body;

            const result = await CateRepo.deleteCategory(id);
            
            result ? res.status(200).send('Xóa thành công')
            : res.status(400);
        } catch {
            res.status(500);
        }

    }
    async restoreCategory(req: Request, res: Response): Promise<void> {
        try{
            const { id } = req.body;

            const result = await CateRepo.restoreCategory(id);
            
            result ? res.status(200).send('Khôi phục thành công')
            : res.status(400);
        } catch {
            res.status(500);
        }

    }
}

export default new CategoryController();
