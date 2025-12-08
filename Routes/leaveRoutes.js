
import express from 'express';
import {
  getLeaves,
  getLeave,
  createLeave,
  updateLeaveStatus,
} from '../Controllers/leaveController.js';
import Leave from '../Models/LeaveModel.js';

import { protect } from '../Middlewares/authMiddleware.js';
import { authorize } from '../Middlewares/roleMiddleware.js';
import advancedResults from '../Middlewares/advancedResults.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    protect,
    authorize('Admin', 'Manager'),
    advancedResults(Leave, { path: 'employee', select: 'firstName lastName' }),
    getLeaves
  )
  .post(protect, createLeave);

router
  .route('/:id')
  .get(protect, getLeave)
  .put(protect, authorize('Admin', 'Manager'), updateLeaveStatus);

export default router;
