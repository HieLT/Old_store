import express from "express";
import categoryController from "../controllers/category.controller";
import attributeController from "../controllers/attribute.controller";

const publicRouter = express.Router();

publicRouter.get(
    '/categories',
    categoryController.getCategories
)

publicRouter.get(
    '/categories/:id/attributes',
    attributeController.getAttributesOfCategory
)

export default publicRouter;