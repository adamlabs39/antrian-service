import express from "express";
import { JadwalDokterController } from "../controllers/jadwal-dokter.controller.js";
import { jadwalDokterRoutes } from "./jadwal-dokter.route.js";

export const routes = express.Router();

routes.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

/**
 * Api Konfigurasi Jadwal Dokter
 * @ref
 */
routes.use("/jadwal-dokter", jadwalDokterRoutes);
