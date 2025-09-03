import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMRouter = express.Router();

APMRouter.post("/register", APMController.registerPatient);
APMRouter.post("/check-in", APMController.checkInPatient);
APMRouter.post("/print-antrian", APMController.printAntrian);
APMRouter.post("/antrian-farmasi", APMController.antrianFarmasi);

