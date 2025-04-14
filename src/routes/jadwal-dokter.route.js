import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";

export const jadwalDokterRouter = express.Router();

/**
 * Gets all the schedules available grouped by the doctor and location.
 */
jadwalDokterRouter.get("/", JadwalDokterController.findAll);

/**
 * api key version
 */
jadwalDokterRouter.get("/", JadwalDokterController.findAllWithAPIKey);

/**
 * Gets all the schedules available for a specific doctor and location.
 */
jadwalDokterRouter.get(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.findAllByDoctorAndLocation
);

/**
 * Creates a new schedule for a specific doctor and location.
 */
jadwalDokterRouter.post("/", JadwalDokterController.create);

/**
 * Updates the schedule for a specific doctor and location.
 */
jadwalDokterRouter.put(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.updateByDoctorAndLocation
);

/**
 * Deletes the schedule for a specific doctor and location.
 */
jadwalDokterRouter.delete(
  "/:doctor_uuid/:location_uuid",
  JadwalDokterController.deleteByDoctorAndLocation
);
