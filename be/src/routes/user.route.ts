import express from "express";
import userController from "../controllers/userController";
const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.put('/reset-password', userController.resetPassword);

export default userRouter;