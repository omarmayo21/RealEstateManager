import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";


const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "real-estate",
    resource_type: "auto",
  }),
});


export const upload = multer({ storage });
