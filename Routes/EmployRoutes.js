import express from "express";
import { CreateEmploy, GetAllEmploy, GetEmployById, UpdateEmploy, DeleteEmploy } from "../Controler/EmployControler.js";
import uploader from "../Middleware/FileUpload.js";

const router = express.Router();

// yahan routes define karo
router.get("/", GetAllEmploy);
router.get("/:id", GetEmployById);
router.post("/",uploader.single("profileImage") ,CreateEmploy);
router.put("/:id", uploader.single("profileImage"), UpdateEmploy);
router.delete("/:id", DeleteEmploy);

export default router;
