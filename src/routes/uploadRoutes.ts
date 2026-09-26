import { Router } from "express";
import upload from "../config/multer";
import { uploadPhoto } from "../controllers/uploadController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  upload.single("photo"),
  uploadPhoto
);

export default router;