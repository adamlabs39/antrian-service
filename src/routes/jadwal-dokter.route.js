import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";

export const jadwalDokterRouter = express.Router();

jadwalDokterRouter.get("/", JadwalDokterController.findAll);

jadwalDokterRouter.get(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.findAllByDoctorAndLocation
);

jadwalDokterRouter.post("/", JadwalDokterController.create);

jadwalDokterRouter.put(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.updateByDoctorAndLocation
);

jadwalDokterRouter.delete(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.deleteByDoctorAndLocation
);
