import express from "express";
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from "./middlewares/rateLimitMiddleware.js"; // Ensure the file extension is included
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Load env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use(rateLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 

// Default Route
app.get('/', (req, res) => {
    res.send("Ecommerce API is running... ✅");
});

export default app;