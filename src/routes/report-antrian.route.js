import express from "express";
import { ReportAntrianController } from "../controllers/report-antrian.controller.js";

export const ReportAntrianRouter = express.Router();

ReportAntrianRouter.post("/cancle-booking", ReportAntrianController.cancelBooking);
