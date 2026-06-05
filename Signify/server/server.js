const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const gestureRoutes = require("./routes/gestures");
const connectDB  = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allow deployed frontend + local dev origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/gestures", gestureRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "Signify API is running 🤟" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));