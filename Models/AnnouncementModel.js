
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
