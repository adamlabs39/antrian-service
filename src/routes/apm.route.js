import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMRouter = express.Router();

APMRouter.get("/data-pasien/:identity", APMController.getDataByIdentity);

// APMRouter.get("/data-pasien/jkn/:no_bpjs", APMController.getDataByJKN);

APMRouter.get(
  "/jadwal-tersedia/:poli_uuid",
  APMController.getAvailableSchedule
);
