import express from "express";
import { LayarAntrianController } from "../controllers/layar-antrian.controller.js";

export const layarAntrianRouter = express.Router();

layarAntrianRouter.get("/", LayarAntrianController.findAll);

layarAntrianRouter.get("/:layarAntrianUUID", LayarAntrianController.findOne);

layarAntrianRouter.post("/", LayarAntrianController.create);

layarAntrianRouter.put("/:layarAntrianUUID", LayarAntrianController.update);

layarAntrianRouter.delete("/:layarAntrianUUID", LayarAntrianController.delete);
