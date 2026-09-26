import { Router, Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { authenticateToken } from "../middleware/authMiddleware"; // adjust path as needed

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.post(
  "/",
  authenticateToken,
  upload.array("photos", 3),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: "No files uploaded" });
        return;
      }

      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "political_posters_uploads" },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        });
      });

      const urls = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        urls,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "Image upload failed" });
    }
  }
);

export default router;