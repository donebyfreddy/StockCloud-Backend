import express from "express";
import { isAuthenticated } from "../db_middleware/user_auth.js";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrandById,
  getAllModels,
  getModelById,
  createModel,
  updateModelById,
} from "../controllers/catalog_controller.js";

const catalogRouter = express.Router();

// Brand routes
catalogRouter.get("/brands/all", getAllBrands);
catalogRouter.get("/brands/:id", getBrandById);
catalogRouter.post("/brands/new", isAuthenticated, createBrand);
catalogRouter.patch("/brands/:id", isAuthenticated, updateBrandById);

// Model routes
catalogRouter.get("/models/all", getAllModels);
catalogRouter.get("/models/:id", getModelById);
catalogRouter.post("/models/new", isAuthenticated, createModel);
catalogRouter.patch("/models/:id", isAuthenticated, updateModelById);

export default catalogRouter;
