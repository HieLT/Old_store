import express from "express";
import locationController from "../controllers/location.controller";
const locationRouter = express.Router();

locationRouter.get('./address' , locationController.getAddress);
locationRouter.get('/wards', locationController.getWards);

export default locationRouter;
