import {Request, Response} from "express";
import AttributeRepository from "../repositories/attribute.repository";
import Category from "../models/category";
import { checkIsObjectId } from "../utils/helpers";
import attributeRepository from "../repositories/attribute.repository";
class AttributeController {
    async getAttributesOfCategory(req: Request, res: Response): Promise<void> {
        try{
            const categoryId = req.body;
            if (!checkIsObjectId(categoryId)) {
                res.status(400).send({message: 'ID danh mục không hợp lệ'});
                return;
            }
            const category = await Category.findOne({_id: categoryId, is_deleted: false})
            if (!category) {
                res.status(404).send({message: 'Danh mục không tồn tại'});
                return;
            }

            const attributes = await attributeRepository.getAttributes(categoryId);

            attributes ? res.status(200).send({attributes}) : res.status(400).send('Không có attributes nào');
        } catch {
            res.status(500);
        }
    }

    async updateAttributes(req: Request, res: Response): Promise<any> {
        return AttributeRepository.handleUpdateAttributes(req.params.id, req.body, res)
    }
}

export default new AttributeController();
