import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "real-estate",
      resource_type: isPdf ? "raw" : "image",
      access_mode: "public", // 🔥 ده المهم
    };
  },
});



export const upload = multer({ storage });
