import express from "express";
import { isAuthenticated } from "../db_middleware/user_auth.js";

import {
  getAllDevices, getDeviceById, getDeviceTypes, getDeviceLocations, getDeviceManufacturers,
  createDevice, updateDevice, deleteDevice, getDevicesWithWarrantyBelowSixMonths, countDevices,
  getDeviceTypeCount
} from "../controllers/device_controller.js";



const router = express.Router();

// Create a new device
router.post('/new', isAuthenticated, createDevice);


// Get all devices with optional search, filtering, and pagination
router.get('/all', getAllDevices);
router.get('/types', getDeviceTypes);
router.get('/locations', getDeviceLocations);
router.get('/manufacturers', getDeviceManufacturers);
router.get('/warranty_6months', getDevicesWithWarrantyBelowSixMonths);
router.get('/count', countDevices);

router.get('/types/count', getDeviceTypeCount)



// Get a specific device by ID
router.get('/:id', getDeviceById);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);


export default router;
