import express from "express";
import { DataAntrianController } from "../controllers/data-antrian.controller.js";

export const dataAntrianRouter = express.Router();

dataAntrianRouter.get("/admisi", DataAntrianController.findAllAdmisi);

dataAntrianRouter.get("/poli", DataAntrianController.findAllPoli);

dataAntrianRouter.get("/farmasi", DataAntrianController.findAllFarmasi);

// dataAntrianRouter.post("/generate-codes", DataAntrianController.generateCodes);

dataAntrianRouter.post(
  "/process-registration",
  DataAntrianController.processRegistration
);
