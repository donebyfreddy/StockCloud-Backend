import express from 'express';
import { sqlQueries, ChatBot } from '../controllers/other_controller.js';  // Import your controller
import { isAuthenticated } from '../db_middleware/user_auth.js'; // Import the authentication middleware

const router = express.Router();

// Route for executing SQL queries
router.post('/sql-queries', sqlQueries);  
router.post('/chatbot', Chatbot)

export default router;
