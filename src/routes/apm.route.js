import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMRouter = express.Router();


APMRouter.post("/check-patient", APMController.checkPatientStatus);

APMRouter.post("/register", APMController.registerPatient);

// APMRouter.post("/check-in", APMController.checkIn);