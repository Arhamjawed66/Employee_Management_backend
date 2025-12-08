
import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../Controllers/taskController.js';
import Task from '../Models/TaskModel.js';

import { protect } from '../Middlewares/authMiddleware.js';
import { authorize } from '../Middlewares/roleMiddleware.js';
import advancedResults from '../Middlewares/advancedResults.js';
import fileUpload from '../Middlewares/FileUpload.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    protect,
    advancedResults(Task, { path: 'assignedTo', select: 'firstName lastName' }),
    getTasks
  )
  .post(protect, authorize('Manager'), createTask);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, fileUpload.single('submittedFile'), updateTask)
  .delete(protect, authorize('Manager'), deleteTask);

export default router;
