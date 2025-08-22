import express from "express";
import { DataAntrianController } from "../controllers/data-antrian.controller.js";

export const dataAntrianRouter = express.Router();



// dataAntrianRouter.post("/generate-codes", DataAntrianController.generateCodes);

dataAntrianRouter.post(
  "/process-registration",
  DataAntrianController.processRegistration
);

dataAntrianRouter.post(
  "/admisi-registration",
  DataAntrianController.regisAdmisi
);
