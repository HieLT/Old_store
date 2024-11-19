import express from "express";
import postController from "../controllers/post.controller";
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";
import multer from "../utils/multer";
const postRouter = express.Router();

postRouter.post('/images-upload', [authentication, isNotDeleted, multer.getUpload().array('files')], postController.imagesUpload);
postRouter.post('/create',[authentication, isNotDeleted], postController.createPost);
postRouter.patch('/:id/visibility', [authentication, isNotDeleted], postController.changeVisibility);

export default postRouter;