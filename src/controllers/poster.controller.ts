import { Response } from 'express';
import { Poster } from '../models/Poster';
import { generatePosterDesignConfig } from '../services/gemini.service';
import { renderPosterToBuffer } from '../services/renderer.service';
import cloudinary from '../config/cloudinary'; 
import { AuthRequest } from '../middleware/authMiddleware';

const uploadBufferToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'generated_posters', format: 'png' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

export const createPoster = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID missing from token',
      });
    }

    const {
      templateId,
      name,
      designation,
      party,
      location,
      occasion,
      headline,
      subline,
      photoUrls,
    } = req.body;

    const newPoster = new Poster({
      userId,
      templateId,
      formData: { name, designation, party, location, occasion, headline, subline },
      uploadedPhotoUrls: photoUrls || [],
      status: 'generating',
    });
    await newPoster.save();

    const aiConfig = await generatePosterDesignConfig(headline, occasion, party);

    const imageBuffer = await renderPosterToBuffer({
      formData: {
        name,
        designation,
        party,
        location,
        headline,
        occasion,
        subline,
      },
      photoUrls: photoUrls || [],
      aiConfig,
    });

    const generatedImageUrl = await uploadBufferToCloudinary(imageBuffer);

    newPoster.generatedImageUrl = generatedImageUrl;
    newPoster.status = 'completed';
    newPoster.aiEnhancements = {
      suggestedSubHeadline: aiConfig.suggestedSubline,
      accentColor: aiConfig.primaryAccentColor,
    };
    await newPoster.save();

    res.status(201).json({
      success: true,
      data: newPoster,
    });
  } catch (error: any) {
    console.error('Poster creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Poster generation failed' });
  }
};

export const getUserPosters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const posters = await Poster.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posters.length,
      data: posters,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPosterById = async (req: AuthRequest, res: Response) => {
  try {
    const poster = await Poster.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found' });
    }

    res.status(200).json({ success: true, data: poster });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePoster = async (req: AuthRequest, res: Response) => {
  try {
    const poster = await Poster.findByIdAndDelete(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'Poster not found' });
    }

    res.status(200).json({ success: true, message: 'Poster deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};