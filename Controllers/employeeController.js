
import Employee from '../Models/EmployeeModel.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';

// @desc      Get all employees
// @route     GET /api/v1/employees
// @access    Private/Admin
const getEmployees = asyncHandler(async (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(200).json(res.advancedResults);
});

// @desc      Get single employee
// @route     GET /api/v1/employees/:id
// @access    Private/Admin
const getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id).populate('team');

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(200).json({ success: true, data: employee });
});

// @desc      Create employee
// @route     POST /api/v1/employees
// @access    Private/Admin
const createEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, phone, department, salary, category, hireDate } = req.body;
  const [firstName, lastName] = name.split(' ');
  const employeeData = {
    firstName,
    lastName: lastName || '',
    email,
    phone,
    department,
    salary: Number(salary),
    category,
    hireDate: new Date(hireDate),
    password: 'defaultpassword123', // Default password, should be changed later
    profilePicture: req.file ? req.file.path : '/default-avatar.png',
  };

  // Ensure all required fields are set
  if (!employeeData.firstName || !employeeData.lastName || !employeeData.email || !employeeData.phone || !employeeData.department || !employeeData.salary || !employeeData.category || !employeeData.hireDate) {
    return next(new ErrorResponse('All required fields must be provided', 400));
  }

  // Validate data types and set defaults for undefined values
  if (typeof employeeData.salary !== 'number' || isNaN(employeeData.salary)) {
    employeeData.salary = 0;
  }
  if (!employeeData.hireDate || isNaN(employeeData.hireDate.getTime())) {
    employeeData.hireDate = new Date();
  }

  const employee = await Employee.create(employeeData);

  res.status(201).json({
    success: true,
    data: employee,
  });
});

// @desc      Update employee
// @route     PUT /api/v1/employees/:id
// @access    Private/Admin
const updateEmployee = asyncHandler(async (req, res, next) => {
  const { name, email, phone, department, salary, category, hireDate } = req.body;
  const updateData = {};

  if (name) {
    const [firstName, lastName] = name.split(' ');
    updateData.firstName = firstName;
    updateData.lastName = lastName || '';
  }
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (department) updateData.department = department;
  if (salary) updateData.salary = Number(salary);
  if (category) updateData.category = category;
  if (hireDate) updateData.hireDate = new Date(hireDate);
  if (req.file) updateData.profilePicture = req.file.path;

  const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: employee });
});

// @desc      Delete employee
// @route     DELETE /api/v1/employees/:id
// @access    Private/Admin
const deleteEmployee = asyncHandler(async (req, res, next) => {
  await Employee.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc      Update user profile
// @route     PUT /api/v1/employees/profile
// @access    Private
const updateProfile = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email } = req.body;
    const employee = await Employee.findById(req.user.id);
  
    if (!employee) {
      return next(new ErrorResponse("Employee not found", 404));
    }
  
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;

    if (req.file) {
      employee.profilePicture = req.file.path;
    } else if (!employee.profilePicture) {
      employee.profilePicture = '/default-avatar.png';
    }
  
    const updatedEmployee = await employee.save();
  
    res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  });

export {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateProfile,
};
