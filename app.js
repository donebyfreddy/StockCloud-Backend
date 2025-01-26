import express from "express";
import { connectdb } from "./db_middleware/user_db.js"; // Import the connectdb and getDb functions
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import openAIRoutes from "./routes/openAIRoutes";

//import productRouter from "./routes/productRoutes.js";
import storageRouter from "./routes/storageRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
//import analyticsRouter from "./routes/analyticsRoutes.js";
import userRouter from "./routes/userRoutes.js";
import deviceRouter from "./routes/deviceRoutes.js";
import otherRouter from "./routes/otherRoutes.js";
import assetRouter from "./routes/assetManagementRoutes.js";


import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

// Call connectdb once to initiate the database connection
connectdb();

const app = express();
dotenv.config();


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://white-meadow-03749f71e.4.azurestaticapps.net');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }
//   next();
// });

const allowedOrigins = [
  process.env.REACT_APP_ORIGIN_1,
  process.env.REACT_APP_ORIGIN_2,
  process.env.REACT_APP_ORIGIN_3
].filter(Boolean); // Filters out undefined or empty values


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
}));

//app.use(
//   cors({
//     origin: 'https://white-meadow-03749f71e.4.azurestaticapps.net',
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"], // Specify the necessary headers
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//   })
// );

// app.options('*', cors({
//   origin: 'https://white-meadow-03749f71e.4.azurestaticapps.net',
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
//   credentials: true,
// }));



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Assets blob
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "build")));
app.use('/src/assets', express.static(path.join(__dirname, '/frontend/src/assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// IVMS Routes
app.use("/api/users", userRouter);
app.use("/api/devices", deviceRouter);
app.use("/api/storages", storageRouter);
app.use("/api/location", locationRouter);

app.use("/api/assignments", assetRouter);

app.use("/api/other", otherRouter);

app.get("/", (req, res) => {
  res.send("<h1>working nicely</h1>");
});

app.use((error, req, res, next) => {
  console.log(error, error.message);
  return res.status(400).json({ message: "internal server error" });
});

app.listen(process.env.PORT,() => {
  console.log(
    `Server is working at port:${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
