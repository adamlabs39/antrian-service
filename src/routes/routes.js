import express from "express";
import { jadwalDokterRouter } from "./jadwal-dokter.route.js";
import { layarAntrianRouter } from "./layar-antrian.route.js";

export const router = express.Router();

router.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

/**
 * Api Konfigurasi Jadwal Dokter
 * @ref ./jadwal-dokter.route.js
 */
router.use("/jadwal-dokter", jadwalDokterRouter);

/**
 * Api Konfigurasi Layar Antrian
 * @ref ./layar-antrian.route.js
 */
router.use("/layar-antrian", layarAntrianRouter);
