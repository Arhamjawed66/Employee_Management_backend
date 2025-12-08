
import Employee from '../Models/EmployeeModel.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';
import sendTokenResponse from '../Utils/sendTokenResponse.js';

// @desc      Register employee
// @route     POST /api/v1/auth/register
// @access    Public
const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, category } = req.body;

  // Create employee
  const employee = await Employee.create({
    firstName,
    lastName,
    email,
    password,
    role,
    category,
    profilePicture: req.file ? req.file.path : '',
  });

  sendTokenResponse(employee, 200, res);
});

// @desc      Login employee
// @route     POST /api/v1/auth/login
// @access    Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const employee = await Employee.findOne({ email }).select('+password');

  if (!employee) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await employee.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(employee, 200, res);
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
const getMe = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

export { register, login, getMe, logout };
