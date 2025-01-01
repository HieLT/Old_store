import express from "express";
import adminDashboardController from "../controllers/adminDashBoard.controller"
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";

const adminDashboardRouter = express.Router();


adminDashboardRouter.get('/overall-stats', [authentication, isNotDeleted], adminDashboardController.overallStats);
adminDashboardRouter.get('/active-conversations',[authentication, isNotDeleted], adminDashboardController.getActiveConversation);
adminDashboardRouter.get('/user-growth',[authentication, isNotDeleted], adminDashboardController.getUserGrowth);
adminDashboardRouter.get('/order-by-status',[authentication, isNotDeleted], adminDashboardController.getOrderByStatus);
adminDashboardRouter.get('/order-by-time',[authentication, isNotDeleted], adminDashboardController.getOrderByTime);
adminDashboardRouter.get('/post-per-category',[authentication, isNotDeleted], adminDashboardController.getPostsPerCategory );
adminDashboardRouter.get('/post-by-status',[authentication, isNotDeleted], adminDashboardController.getPostsByStatus);


export default adminDashboardRouter;
