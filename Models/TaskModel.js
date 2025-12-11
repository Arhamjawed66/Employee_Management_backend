
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Reviewe"],
    default: "Pending",
  },
  submittedFile: {
    type: String,
  },
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;
