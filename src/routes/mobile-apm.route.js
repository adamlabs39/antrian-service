import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMMobileRouter = express.Router();

APMMobileRouter.post(
  "/process-registration",
  APMController.registerPatientMobile
);
