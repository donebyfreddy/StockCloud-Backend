import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' });

export const sendcookie = (user, res, message, statuscode = 200) => {
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
  
  res
    .status(statuscode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 60 * 10000,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message,
    });
};
