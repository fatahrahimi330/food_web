import { Router } from 'express';
import admin from '../middleware/admin.mid.js';
import multer from 'multer';
import handler from 'express-async-handler';
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { configCloudinary } from '../config/cloudinary.config.js';

const router = Router();
const upload = multer();

router.post(
  '/',
  admin,
  upload.single('image'),
  handler(async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(BAD_REQUEST).send();
      }

      const imageUrl = await uploadImageToCloudinary(file.buffer);
      res.send({ imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).send('Error uploading image');
    }
  })
);

const uploadImageToCloudinary = (imageBuffer) => {
  const cloudinary = configCloudinary();

  return new Promise((resolve, reject) => {
    if (!imageBuffer) reject(new Error('No image buffer provided'));

    cloudinary.uploader.upload_stream((error, result) => {
      if (error || !result) reject(error);
      else resolve(result.url);
    }).end(imageBuffer);
  });
};

export default router;
