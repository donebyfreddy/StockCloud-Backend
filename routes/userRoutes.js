import express from "express";
import { getAllUsers, getNamesUsers, getMyProfile, uploadImage, login, 
  logout, register, updateUser, getUserLocationCount } from "../controllers/user_controller.js";

import { isAuthenticated } from "../db_middleware/user_auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/all", getAllUsers);
router.get("/names", getNamesUsers);


router.get("/me", isAuthenticated, getMyProfile);

router.post("/upload-image", isAuthenticated, uploadImage);

router.patch('/:id', updateUser);

// Analytics
router.get('/locations/count', getUserLocationCount)


//router.patch("/update", isAuthenticated, updateUser);
//router.patch("/update/:id", updateUser);

// Define parameterized routes last
// router.get('/:id', getStorageById);

// router.delete('/:id',  deleteStorage);





export default router;
