import express from "express";
import { jadwalDokterRouter } from "./jadwal-dokter.route.js";
import { layarAntrianRouter } from "./layar-antrian.route.js";
import { dataAntrianRouter } from "./data-antrian.route.js";
import { APMRouter } from "./apm.route.js";
import { jadwalDokterMobileRouter } from "./mobile-jadwal-dokter.route.js";
import { APMMobileRouter } from "./mobile-apm.route.js";
import { AdmisiAntrianRouter } from "./admisi-antrian.route.js";
import { AdmisiAntrianMobileRouter } from "./mobile-admisi-antrian.route.js";

export const router = express.Router();

router.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

router.use("/jadwal-dokter", jadwalDokterRouter);

router.use("/layar-antrian", layarAntrianRouter);

router.use("/data-antrian", dataAntrianRouter);

router.use("/apm", APMRouter);

router.use("/admisi-antrian", AdmisiAntrianRouter);

//FOR MOBILE
router.use("/mobile/jadwal-dokter", jadwalDokterMobileRouter);

router.use("/mobile/apm", APMMobileRouter);

router.use("/mobile/admisi-antrian", AdmisiAntrianMobileRouter);
