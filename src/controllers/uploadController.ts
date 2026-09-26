import { Request, Response } from "express";
import fs from "fs";
import cloudinary from "../config/cloudinary";

export const uploadPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No photo uploaded",
      });
      return;
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "poster-politics",
    });

    fs.unlink(req.file.path, (error) => {
      if (error) {
        console.error("Temporary file deletion failed:", error);
      }
    });

    res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Photo upload error:", error);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      success: false,
      message: "Photo upload failed",
    });
  }
};