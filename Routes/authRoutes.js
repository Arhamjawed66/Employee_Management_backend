
import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
} from '../Controllers/authController.js';

import { protect } from '../Middlewares/authMiddleware.js';
import upload from '../Middlewares/FileUpload.js';

const router = express.Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;
