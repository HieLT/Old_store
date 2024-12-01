import express from "express";
const notificationRouter = express.Router();
import notificationController from "../controllers/notification.controller";
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";

notificationRouter.get('/', [authentication, isNotDeleted], notificationController.getNotifications);
notificationRouter.get('/create', [authentication, isNotDeleted], notificationController.deleteNotification);
notificationRouter.patch('/update/:id',[authentication, isNotDeleted] , notificationController.updateNotification);
notificationRouter.patch('/delete/:id',[authentication, isNotDeleted], notificationController.deleteNotification);

export default notificationRouter;
