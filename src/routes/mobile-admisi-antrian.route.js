import express from "express";
import { AdmisiAntrianController } from "../controllers/admisi-antrian.controller.js";

export const AdmisiAntrianMobileRouter = express.Router();

AdmisiAntrianMobileRouter.post("/", AdmisiAntrianController.createAntrianMobile);