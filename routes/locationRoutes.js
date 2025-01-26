import express from "express";
import { getAllLocations, getLocationById, updateLocation, 
  createLocation } from "../controllers/location_controller.js";
import { isAuthenticated } from "../db_middleware/user_auth.js";

const locationRouter = express.Router();

locationRouter.get("/all", getAllLocations);
locationRouter.get("/:id", getLocationById);
locationRouter.patch("/:id", isAuthenticated, updateLocation);
locationRouter.post("/new", isAuthenticated, createLocation);

export default locationRouter;
