
import express from 'express';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../Controllers/announcementController.js';
import Announcement from '../Models/AnnouncementModel.js';

import { protect } from '../Middlewares/authMiddleware.js';
import { authorize } from '../Middlewares/roleMiddleware.js';
import advancedResults from '../Middlewares/advancedResults.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    protect,
    advancedResults(Announcement, { path: 'author', select: 'firstName lastName' }),
    getAnnouncements
  )
  .post(protect, authorize('Admin'), createAnnouncement);

router
  .route('/:id')
  .get(protect, getAnnouncement)
  .put(protect, authorize('Admin'), updateAnnouncement)
  .delete(protect, authorize('Admin'), deleteAnnouncement);

export default router;
