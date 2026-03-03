import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import treatmentRoutes from "./routes/treatmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();

/* =========================
   CORS CONFIGURATION FIX
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://physio-manager.netlify.app",
  "https://pms-ten-tau.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, postman etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// important for preflight
app.options("*", cors());

/* ========================= */

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(apiLimiter);

/* =========================
        ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activitylogs", activityLogRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* =========================
        ERROR HANDLER
========================= */

app.use(errorHandler);

/* ========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});