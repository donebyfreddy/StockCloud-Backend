import multer from "multer";
import fs from "fs";

import { fileURLToPath } from "url";
import path from 'path'

import bcrypt from "bcrypt";
import { sendcookie } from "../db_middleware/user_utils.js";

import UserModel from "../models/user_model.js";
//import LocationModel from "../models/location_model.js";




// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure 'uploads' folder exists
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true }); // Creates folder if it doesn't exist
}

// Multer User configuration
const User = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR); // Save files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use unique filename
  },
});

// Multer instance for file uploads
const upload = multer({ User });

// Middleware to handle file uploads
export const uploadImage = async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Error uploading image.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Please upload an image.",
        });
      }

      // Find the authenticated user
      const user = await UserModel.findByPk(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Update user's image field
      user.image = `/uploads/${req.file.filename}`; // Store relative path

      // Save updated user document
      await user.save();

      res.status(200).json({
        success: true,
        message: `Profile image uploaded successfully for ${user.name}.`,
        user,
      });
    } catch (error) {
      next(error);
    }
  });
};


export const getNamesUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll().select('name');
    
    res.json(users); // Send only the names as a response
  } catch (error) {
    res.status(500).json({ message: "Error fetching storages" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll(); // Fetch all users without any conditions
    res.status(200).json({ success: true, users });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserModel.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'password'], // Include password explicitly
    });

    // If the user does not exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Register first",
      });
    }


    const encrypted = await bcrypt.compare(password, user.password);
    if (!encrypted) {
      return res.status(404).json({
        success: false,
        message: "your password is incorrect",
      });
    }

    sendcookie(user, res, `welcome back,${user.name}`, 201);
    
  } catch (e) {
    console.error(e);  // Log the error
    return res.status(500).json({ success: false, message: 'Server error' });  // Send error response
  }
};


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, location, department, contactNumber, status } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, and password) are required",
      });
    }

    // Set default values for optional fields
    const userRole = role || "user"; // Default role to 'user'
    const userDepartment = department || "None"; // Default role to 'user'
    const userLocation = location || "default location"; // Set your preferred default location
    const userContactNumber = contactNumber || "0000000000"; // Set a default contact number
    const userStatus = status || "active"; // Default status to 'active'

    // Check if the user already exists
    let user = await UserModel.findOne({
      where: { email }, // Using `where` to match the email in Sequelize
    });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    user = await UserModel.create({
      name,
      email,
      password: hashedPassword, // Storing the hashed password
      role: userRole,
      location: userLocation,
      department: userDepartment,
      contactNumber: userContactNumber,
      status: userStatus,
    });

    // Send the success response with the cookie
    await sendcookie(user, res, "User registered successfully", 201);
    
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: e.message,
    });
  }
};



export const getMyProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Construct the full URL for the image
    const imageUrl = user.image ? `${req.protocol}://${req.get('host')}/uploads/${user.image}` : null;

    res.status(200).json({
      success: true,
      message: `Your profile is found, ${req.user.name}`,
      user: {
        ...user.toJSON(), // Convert user instance to plain object
        image: imageUrl, // Add the full image URL
      },
    });
  } catch (e) {
    next(e);
  }
};




export const logout = async (req, res, next) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(0),
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "development" ? false : true,
      })
      .status(200)
      .json({
        success: true,
        message: "Successfully logged out",
        user: req.user, // the user info is in the request, assuming it's populated earlier (e.g., by middleware)
      });
  } catch (e) {
    next(e);
  }
};



export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Find the User unit by primary key
    const user = await UserModel.findByPk(id);

    // If the User unit is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the User unit
    await UserModel.update(updatedData);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


// Fetch the count of users for each location and include the location name
export const getUserLocationCount = async (req, res) => {
  try {
    // Use Sequelize's count method to count users by location
    const userLocationCount = await UserModel.count({
      attributes: ['location'], // Group by location ID
      group: ['location'], // Group by location ID and location name
    });

    // Check if user location counts were found
    if (!userLocationCount || userLocationCount.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user location counts found",
      });
    }

    // Respond with the counts of users per location
    res.status(200).json({
      success: true,
      users: userLocationCount, // This will include location and count with location name
    });
  } catch (error) {
    console.error("Error fetching user location count:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



