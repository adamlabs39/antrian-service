import express from "express";
import { APMController } from "../controllers/apm.controller.js";

export const APMRouter = express.Router();


/**
 * Mengambil daftar semua poliklinik yang tersedia untuk pendaftaran.
 * APM akan memanggil ini di langkah pertama pemilihan poli.
 */
// APMRouter.get("/poliklinik", APMController.getAvailablePoliklinik);

/**
 * Mengambil daftar dokter yang tersedia di poliklinik tertentu.
 * APM akan memanggil ini setelah pasien memilih poli.
 */
// APMRouter.get("/dokter/:poli_uuid", APMController.getAvailableDokter);

/**
 * Mengambil detail jadwal (hari dan jam) untuk dokter dan poli tertentu.
 * APM akan memanggil ini setelah pasien memilih dokter.
 */
// APMRouter.get("/jadwal/:dokter_uuid/:poli_uuid", APMController.getJadwalDetail);

APMRouter.post("/check-patient", APMController.checkPatientStatus);

APMRouter.post("/register", APMController.registerPatient);
