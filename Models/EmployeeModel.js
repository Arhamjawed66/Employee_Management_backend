
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["Admin", "Employee"],
    default: "Employee",
  },
  category: {
    type: String,
    enum: ["Manager", "Supervisor", "Staff"],
    required: function() { return this.role === "Employee"; },
  },
  profilePicture: {
    type: String,
    default: "/default-avatar.png",
  },
  phone: {
    type: String,
    required: function() { return this.role !== 'Admin'; },
  },
  department: {
    type: String,
    required: function() { return this.role !== 'Admin'; },
  },
  salary: {
    type: Number,
    required: function() { return this.role !== 'Admin'; },
  },
  hireDate: {
    type: Date,
    required: function() { return this.role !== 'Admin'; },
  },
  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  }],
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  attendanceRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Encrypt password using bcrypt
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
employeeSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
