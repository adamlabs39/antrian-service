import express from "express";
import { AdmisiAntrianController } from "../controllers/admisi-antrian.controller.js";

export const AdmisiAntrianRouter = express.Router();

AdmisiAntrianRouter.get("/", AdmisiAntrianController.getAllAntrian);
AdmisiAntrianRouter.get("/all", AdmisiAntrianController.getAllNoPagination);
AdmisiAntrianRouter.get("/:uuid", AdmisiAntrianController.getAntrianByUuid);
AdmisiAntrianRouter.post("/", AdmisiAntrianController.createAntrian);
AdmisiAntrianRouter.put("/:uuid", AdmisiAntrianController.updateAntrian);