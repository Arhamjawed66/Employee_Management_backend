
import Task from '../Models/TaskModel.js';
import asyncHandler from '../Middlewares/asyncHandler.js';
import ErrorResponse from '../Utils/errorResponse.js';
import Employee from '../Models/EmployeeModel.js';
import mongoose from 'mongoose';

// @desc      Get all tasks
// @route     GET /api/v1/tasks
// @access    Private
const getTasks = asyncHandler(async (req, res, next) => {
    // If user is a manager, get tasks assigned by them or to their team
    if (req.user.category === 'Manager') {
        const myTeam = await Employee.find({ _id: { $in: req.user.team } });
        const myTeamIds = myTeam.map(member => member._id);
        req.query.assignedTo = { $in: myTeamIds.concat(req.user.id) };
    } else if(req.user.role !== 'Admin') { // For other employees, get tasks assigned to them
        req.query.assignedTo = req.user.id;
    }

    res.status(200).json(res.advancedResults);
});

// @desc      Get single task
// @route     GET /api/v1/tasks/:id
// @access    Private
const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'firstName lastName');

  if (!task) {
    return next(
      new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: task });
});

// @desc      Create task
// @route     POST /api/v1/tasks
// @access    Private/Manager
const createTask = asyncHandler(async (req, res, next) => {
  req.body.assignedBy = req.user.id;

  // Handle assignedTo: if it's a string, try to parse it as JSON or treat as single ID
  if (typeof req.body.assignedTo === 'string') {
    try {
      req.body.assignedTo = JSON.parse(req.body.assignedTo);
    } catch (e) {
      // If not JSON, assume it's a single ID and wrap in array
      req.body.assignedTo = [req.body.assignedTo];
    }
  } else if (!Array.isArray(req.body.assignedTo)) {
    req.body.assignedTo = [req.body.assignedTo];
  }

  // Ensure assignedTo contains valid ObjectIds
  req.body.assignedTo = req.body.assignedTo.map(id => {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return new mongoose.Types.ObjectId(id);
    } else {
      // If invalid, try to find employee by name or email (assuming 'manger' is a name)
      // For now, throw error if not valid
      throw new ErrorResponse(`Invalid assignedTo ID: ${id}`, 400);
    }
  });

  // Handle deadline: map dueDate to deadline if present
  if (req.body.dueDate) {
    req.body.deadline = new Date(req.body.dueDate);
    delete req.body.dueDate;
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    data: task,
  });
});

// @desc      Update task status
// @route     PUT /api/v1/tasks/:id
// @access    Private
const updateTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findById(req.params.id);

    if (!task) {
        return next(
          new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
        );
    }
    
    // Make sure user is the assigned user or the manager who assigned it
    if (task.assignedTo.toString() !== req.user.id && task.assignedBy.toString() !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this task`, 401)
          );
    }
    
    // Handle file submission
    if(req.file){
        req.body.submittedFile = req.file.path;
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

  res.status(200).json({ success: true, data: task });
});

// @desc      Delete task
// @route     DELETE /api/v1/tasks/:id
// @access    Private/Manager
const deleteTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        return next(
          new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is the one who assigned the task
    if (task.assignedBy.toString() !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete this task`, 401)
          );
    }

    await task.remove();

    res.status(200).json({ success: true, data: {} });
});


export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
