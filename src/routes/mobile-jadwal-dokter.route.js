import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";

export const jadwalDokterMobileRouter = express.Router();

jadwalDokterMobileRouter.get("/", JadwalDokterController.findAllWithAPIKey);
jadwalDokterMobileRouter.get("/available-kuota", JadwalDokterController.getAvailableKuota);
jadwalDokterMobileRouter.post("/record-booking", JadwalDokterController.recordBooking);
