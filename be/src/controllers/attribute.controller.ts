import {Request, Response} from "express";
import AttributeRepository from "../repositories/attribute.repository";

class AttributeController {
    async getAttributesOfCategory(req: Request, res: Response): Promise<any> {
        return AttributeRepository.getAttributes(req.params.id, res)
    }

    async updateAttributes(req: Request, res: Response): Promise<any> {
        return AttributeRepository.handleUpdateAttributes(req.params.id, req.body, res)
    }
}

export default new AttributeController();
