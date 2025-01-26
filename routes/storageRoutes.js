import express from "express";
import {
  getAllStorages,
  getNamesStorages,
  getStorageById,
  getStorageLocationCount,
  createStorage,
  updateStorage,
  deleteStorage,
} from "../controllers/storage_controller.js";
import { isAuthenticated } from "../db_middleware/user_auth.js";

const router = express.Router();

// Define non-parameterized routes first
router.post('/new', isAuthenticated, createStorage);
router.get('/all', getAllStorages);
router.get('/names', getNamesStorages);

// Analytics
router.get('/locations/count', getStorageLocationCount)


// Define parameterized routes last
router.get('/:id', getStorageById);
router.patch('/:id', updateStorage);
router.delete('/:id',  deleteStorage);

export default router;
