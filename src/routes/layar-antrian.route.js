import express from "express";
import { LayarAntrianController } from "../controllers/layar-antrian.controller.js";

export const layarAntrianRouter = express.Router();

layarAntrianRouter.get("/", LayarAntrianController.findAll);

layarAntrianRouter.get("/:layar_antrian_uuid", LayarAntrianController.findOne);

layarAntrianRouter.post("/", LayarAntrianController.create);

layarAntrianRouter.put("/:layar_antrian_uuid", LayarAntrianController.update);

layarAntrianRouter.delete(
  "/:layar_antrian_uuid",
  LayarAntrianController.delete
);
