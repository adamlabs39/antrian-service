import express from "express";
import { DataAntrianController } from "../controllers/data-antrian.controller.js";

export const dataAntrianRouter = express.Router();

dataAntrianRouter.get("/admisi", DataAntrianController.findAllAdmisi);
