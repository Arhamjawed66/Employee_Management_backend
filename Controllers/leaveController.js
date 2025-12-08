
import Leave from '../Models/LeaveModel.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';
import Employee from '../Models/EmployeeModel.js';

// @desc      Get all leave requests
// @route     GET /api/v1/leaves
// @access    Private/Admin
const getLeaves = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single leave request
// @route     GET /api/v1/leaves/:id
// @access    Private
const getLeave = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id).populate('employee', 'firstName lastName');

  if (!leave) {
    return next(
      new ErrorResponse(`Leave request not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: leave });
});

// @desc      Create leave request
// @route     POST /api/v1/leaves
// @access    Private
const createLeave = asyncHandler(async (req, res, next) => {
  req.body.employee = req.user.id;
  
  const leave = await Leave.create(req.body);

  res.status(201).json({
    success: true,
    data: leave,
  });
});

// @desc      Update leave request status
// @route     PUT /api/v1/leaves/:id
// @access    Private/Admin or Private/Manager
const updateLeaveStatus = asyncHandler(async (req, res, next) => {
  let leave = await Leave.findById(req.params.id);

  if (!leave) {
    return next(
      new ErrorResponse(`Leave request not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update the leave status
  const isManagerOfEmployee = await Employee.exists({ _id: req.user.id, team: leave.employee });

  if(req.user.role !== 'Admin' && (req.user.category !== 'Manager' || !isManagerOfEmployee)){
    return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this leave request`, 401)
      );
  }
  
  leave = await Leave.findByIdAndUpdate(req.params.id, { status: req.body.status, approvedBy: req.user.id }, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: leave });
});

export {
  getLeaves,
  getLeave,
  createLeave,
  updateLeaveStatus,
};
