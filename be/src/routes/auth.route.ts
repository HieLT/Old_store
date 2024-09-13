import express, { NextFunction } from "express";
import authController from "../controllers/authController";
const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/newAccessToken', authController.getNewAccessToken)

authRouter.get('/google', authController.loginGoogle);
authRouter.get('/google/callback', authController.callbackGoogle);

export default authRouter;