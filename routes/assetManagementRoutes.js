import express from "express";
import { getAllAssetsStorages, getAllAssetsUsers, 
createNewAssetStorages, createNewAssetUsers } from '../controllers/assetmanag_controller.js'

import { isAuthenticated } from "../db_middleware/user_auth.js";

const router = express.Router();

router.get("/users/all", getAllAssetsUsers);
router.get("/storages/all", getAllAssetsStorages);

router.post("/users/new", createNewAssetUsers);
router.post("/storages/new", createNewAssetStorages);



export default router;
