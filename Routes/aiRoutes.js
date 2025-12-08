
import express from 'express';
import {
  getJobRecommendations,
  getPerformanceSuggestions,
  getBestEmployee,
  chatWithAdmin,
} from '../Controllers/aiController.js';

import { protect } from '../Middlewares/authMiddleware.js';
import { authorize } from '../Middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/job-recommendations', protect, getJobRecommendations);
router.post(
  '/performance-suggestions',
  protect,
  authorize('Manager,admin'),
  getPerformanceSuggestions
);
router.get(
  '/best-employee',
  protect,
  authorize('admin'),
  getBestEmployee
);
router.post('/chat', protect, authorize('admin'), chatWithAdmin);

export default router;
