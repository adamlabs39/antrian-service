import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";

export const jadwalDokterRoutes = express.Router();

jadwalDokterRoutes.get("/", JadwalDokterController.findAll);

jadwalDokterRoutes.get(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.findOneByDoctorAndLocation
);

jadwalDokterRoutes.post("/", JadwalDokterController.create);

jadwalDokterRoutes.put(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.updateByDoctorAndLocation
);
