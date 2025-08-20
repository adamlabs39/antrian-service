import express from "express";
import { jadwalDokterRouter } from "./jadwal-dokter.route.js";
import { layarAntrianRouter } from "./layar-antrian.route.js";
import { dataAntrianRouter } from "./data-antrian.route.js";
import { APMRouter } from "./apm.route.js";
import { jadwalDokterMobileRouter } from "./mobile-jadwal-dokter.route.js";
// import { tokenRouter } from "./token-helper.route.js";

export const router = express.Router();

router.get("/health", (req, res) => res.status(200).json({ message: "OK" }));

router.use("/jadwal-dokter", jadwalDokterRouter);


router.use("/mobile/jadwal-dokter", jadwalDokterMobileRouter);

router.use("/layar-antrian", layarAntrianRouter);

router.use("/data-antrian", dataAntrianRouter);

router.use("/apm", APMRouter);

