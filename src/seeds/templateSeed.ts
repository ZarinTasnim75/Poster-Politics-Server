import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db";
import Template from "../models/Template";

dotenv.config();

const seedTemplates = async (): Promise<void> => {
  try {
    await connectDB();

    await Template.deleteMany({});

    const templates = [
  {
    title: "মহান বিজয় দিবস",
    occasionType: "victory-day",
    thumbnailUrl: "",
    layoutConfig: {
      photoSlots: 3,
      photoArrangement: "three-top",
      headlinePosition: "center",
      footerPosition: "bottom",
      theme: "red-green",
    },
    isActive: true,
  },

  {
    title: "শোকবার্তা ও শ্রদ্ধাঞ্জলি",
    occasionType: "condolence",
    thumbnailUrl: "",
    layoutConfig: {
      photoSlots: 2,
      photoArrangement: "two-side",
      headlinePosition: "top",
      footerPosition: "bottom",
      theme: "black-white",
    },
    isActive: true,
  },

  {
    title: "জনস্বার্থে প্রচার",
    occasionType: "campaign",
    thumbnailUrl: "",
    layoutConfig: {
      photoSlots: 3,
      photoArrangement: "main-center-two-side",
      headlinePosition: "top",
      footerPosition: "bottom",
      theme: "red-green",
    },
    isActive: true,
  },
];

    await Template.insertMany(templates);

    console.log("Templates seeded successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Template seeding failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedTemplates();