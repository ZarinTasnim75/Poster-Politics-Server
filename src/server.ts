import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GlobalFonts } from "@napi-rs/canvas";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import templateRoutes from "./routes/templateRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import posterRoutes from "./routes/poster.routes";
import {
  authenticateToken,
  AuthRequest,
} from "./middleware/authMiddleware";

dotenv.config();

try {
  const boldFont = path.join(process.cwd(), "src", "assets", "fonts", "NotoSansBengali-Bold.ttf");
  const regularFont = path.join(process.cwd(), "src", "assets", "fonts", "NotoSansBengali-Regular.ttf");

  GlobalFonts.registerFromPath(boldFont, "Noto Sans Bengali");
  GlobalFonts.registerFromPath(regularFont, "Noto Sans Bengali");

  console.log("Bangla static fonts registered successfully with Skia");
} catch (error) {
  console.error("Failed to register Bangla font:", error);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/posters", posterRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Poster Politics Server is running",
  });
});

app.get("/api/protected", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "You can access this protected route",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});