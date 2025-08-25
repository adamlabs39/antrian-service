import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMRouter = express.Router();

APMRouter.post("/register", APMController.registerPatient);

