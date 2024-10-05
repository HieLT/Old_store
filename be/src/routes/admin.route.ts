import express from "express";
import adminController from "../controllers/admin.controller";
import Multer from '../utils/multer';
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";
import isAdmin from "../middlewares/isAdmin";
import isSuperAdmin from "../middlewares/isSuperAdmin";
const adminRouter = express.Router();

adminRouter.get('./get-profile', [authentication, isNotDeleted], adminController.getProfile);
adminRouter.patch('/update',[authentication, isNotDeleted, isAdmin], adminController.updateAdmin);
adminRouter.patch('/update-avatar',[authentication, isNotDeleted, Multer.getUpload().array('files')], adminController.updateAvatar);
adminRouter.post('/create', [authentication, isNotDeleted, isSuperAdmin], adminController.createAdmin);
adminRouter.put('/delete-admin', [authentication, isNotDeleted, isSuperAdmin], adminController.deleteAdmin);
adminRouter.put('/delete-user', [authentication, isNotDeleted, isAdmin], adminController.deleteUser);
adminRouter.post('get-admins', [authentication,isNotDeleted,isSuperAdmin], adminController.searchAdmin);

export default adminRouter;