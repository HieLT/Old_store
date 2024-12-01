import express from "express";
import OrderController from "../controllers/order.controller";
import authentication from "../middlewares/authentication";
import isNotDeleted from "../middlewares/isNotDeleted";
import orderController from "../controllers/order.controller";
import order from "../models/order";

const orderRouter = express.Router();

orderRouter.post('/create', [authentication, isNotDeleted], orderController.createOrder);
orderRouter.get('/',[authentication, isNotDeleted], orderController.getOrder);
orderRouter.get('/get-my-selling-orders',[authentication, isNotDeleted], orderController.getMySellingOrders);
orderRouter.get('/get-my-bying-orders',[authentication, isNotDeleted], orderController.getMyByingOrders);
orderRouter.patch('/update-order-status', [authentication, isNotDeleted], orderController.updateOrderStatus);
orderRouter.patch('/received-order', [authentication, isNotDeleted], orderController.receivedOrder);

export default orderRouter;
