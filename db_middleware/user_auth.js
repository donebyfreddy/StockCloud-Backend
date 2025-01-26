import UserModel from "../models/user_model.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' });

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("token", token);
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "user is not found or Login first",
    });
  }

  const decode = jwt.verify(token, process.env.SECRET_KEY);
 
  console.log("Decoded _id:", decode.id);
  req.user = await UserModel.findOne({ where: { id: decode.id } });
  console.log("User from DB:", req.user);
  
  console.log("Req.User", req.user)
  next();
};