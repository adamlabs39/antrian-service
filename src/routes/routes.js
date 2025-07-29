import express from "express";
import { jadwalDokterRouter } from "./jadwal-dokter.route.js";
import { layarAntrianRouter } from "./layar-antrian.route.js";
import { dataAntrianRouter } from "./data-antrian.route.js";
import { APMRouter } from "./apm.route.js";
// import { tokenRouter } from "./token-helper.route.js";

export const router = express.Router();

router.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

/**
 * Api Konfigurasi Jadwal Dokter
 * @ref ./jadwal-dokter.route.js
 */
router.use("/jadwal-dokter", jadwalDokterRouter);

/**
 * Api Key Version
 */
router.use("/mobile/jadwal-dokter", jadwalDokterRouter);

/**
 * Api Konfigurasi Layar Antrian
 * @ref ./layar-antrian.route.js
 */
router.use("/layar-antrian", layarAntrianRouter);

/**
 * Api data antrian
 * @red ./data-antrian.route.js
 */
router.use("/data-antrian", dataAntrianRouter);

/**
 * Api apm
 * @ref ./apm.route.js
 */
router.use("/apm", APMRouter);


/**
 * APi generate token
 * for developing necessery
 * @ref ./token-helper.route.js
 */
// router.use("/token", tokenRouter)