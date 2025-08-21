import express from "express";
import { DataAntrianController } from "../controllers/data-antrian.controller.js";

export const dataAntrianMobileRouter = express.Router();

dataAntrianMobileRouter.post(
  "/process-registration",
  DataAntrianController.processRegistration
);

