import mongoose, { Document, Schema } from "mongoose";

export interface ILayoutConfig {
  photoSlots: number;
  photoArrangement: string;
  headlinePosition: string;
  footerPosition: string;
  theme: string;
}

export interface ITemplate extends Document {
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  layoutConfig: ILayoutConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    occasionType: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    layoutConfig: {
      photoSlots: {
        type: Number,
        required: true,
        default: 3,
      },

      photoArrangement: {
        type: String,
        required: true,
      },

      headlinePosition: {
        type: String,
        required: true,
      },

      footerPosition: {
        type: String,
        required: true,
      },

      theme: {
        type: String,
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model<ITemplate>("Template", templateSchema);

export default Template;