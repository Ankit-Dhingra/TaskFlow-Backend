require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./connections/mongodb");
const authRouter = require("./routes/userRoute");
const taskRouter = require("./routes/taskRoute");

const app = express();

/* -------------------- SECURITY -------------------- */
app.use(helmet()); // Secure HTTP headers

app.use(
  cors({
    origin: ["http://localhost:5173"], // your frontend
    credentials: true,
  })
);


/* -------------------- RATE LIMITING -------------------- */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1000, // limit each IP
  message: "Too many requests, try again later.",
});

app.use(limiter);


/* -------------------- MIDDLEWARES -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}


/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);


/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


/* -------------------- CONNECT DB & START SERVER -------------------- */
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });
