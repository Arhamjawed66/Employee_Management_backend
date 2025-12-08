
import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateProfile,
} from '../Controllers/employeeController.js';
import Employee from '../Models/EmployeeModel.js';
import { protect } from '../Middlewares/authMiddleware.js';
import { authorize } from '../Middlewares/roleMiddleware.js';
import advancedResults from '../Middlewares/advancedResults.js';
import fileUpload from '../Middlewares/FileUpload.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('Admin'), advancedResults(Employee), getEmployees)
  .post(protect, authorize('Admin'), fileUpload.single('profileImage'), createEmployee);

router.put('/profile', protect, fileUpload.single('profilePicture'), updateProfile);

router
  .route('/:id')
  .get(protect, authorize('Admin'), getEmployee)
  .put(protect, authorize('Admin'), fileUpload.single('profileImage'), updateEmployee)
  .delete(protect, authorize('Admin'), deleteEmployee);

export default router;
