import { Request, Response } from "express";
import mongoose from "mongoose";
import Template from "../models/Template";

export const getTemplates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { occasion } = req.query;

    const filter: {
      isActive: boolean;
      occasionType?: string;
    } = {
      isActive: true,
    };

    if (occasion) {
      filter.occasionType = occasion as string;
    }

    const templates = await Template.find(filter).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get templates",
    });
  }
};

export const getTemplateById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid template ID",
      });
      return;
    }

    const template = await Template.findOne({
      _id: id,
      isActive: true,
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Get template error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get template",
    });
  }
};