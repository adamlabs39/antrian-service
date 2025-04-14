import express from "express";
import TokenHelperController from "../controllers/token-helper.controller.js";

export const tokenRouter = express.Router();

tokenRouter.get("/", TokenHelperController.getToken);

