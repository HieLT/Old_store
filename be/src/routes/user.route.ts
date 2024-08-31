import express, { NextFunction } from "express";
import userController from "../controllers/userController";
import Multer from '../utils/multer';
import authentication from "../middlewares/authentication";
const userRouter = express.Router();


userRouter.put('/update', [authentication] , Multer.getUpload().array('images'), userController.updateUser);

export default userRouter;