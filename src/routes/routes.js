import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";

export const routes = express.Router();

routes.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

/**
 * Api Konfigurasi Jadwal Dokter
 * @ref
 */
routes.get("/jadwal-dokter", JadwalDokterController.findAll);
