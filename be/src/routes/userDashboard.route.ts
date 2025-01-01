import express from "express";
import userDashboardController from "../controllers/userDashBoard.controller"
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";

const userDashboardRouter = express.Router();


userDashboardRouter.get('/revenue',[authentication, isNotDeleted], userDashboardController.getRevenue);
userDashboardRouter.get('/expenses',[authentication, isNotDeleted], userDashboardController.getExpenses);
userDashboardRouter.get('/ratings',[authentication, isNotDeleted], userDashboardController.getRatings);
userDashboardRouter.get('/orders-status',[authentication, isNotDeleted], userDashboardController.getOrdersStatus);

export default userDashboardRouter;
