import express, { NextFunction } from "express";
import userController from "../controllers/userController";
const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.put('/reset-password', userController.resetPassword);
userRouter.get('/auth/google',(req, res, next) => userController.loginGoogle(req, res, next));
userRouter.get('/auth/google/callback', userController.callbackGoogle);
userRouter.get('/auth/google/success', userController.loginGoogleSuccess);
userRouter.get('/auth/google/fail', userController.loginGoogleFail);
userRouter.get('/auth/google/logout', userController.googleLogout);

export default userRouter;