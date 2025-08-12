import { DataAntrianService } from "../services/data-antrian.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class DataAntrianController {
  static async findAll(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const { pagination, data } = await DataAntrianService.findAll({
        faskesUuid,
        filters: req.query || {},
      });

      res.status(200).json({
        message: "Data berhasil ditampilkan.",
        properties: FormatterService.toSnakeCase(pagination),
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async findAllAdmisi(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      const result = await DataAntrianService.findAllAdmisi({
        faskesUuid,
        filters: req.query || {},
      });

      res.status(200).json({
        message: "Data antrian admisi berhasil ditampilkan",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findAllPoli(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const result = await DataAntrianService.findAllPoli({
        faskesUuid,
        filters: req.query || {},
      });
      res.status(200).json({
        message: "Data antrian poliklinik berhasil ditampilkan",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async findAllFarmasi(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const result = await DataAntrianService.findAllFarmasi({
        faskesUuid,
        filters: req.query || {},
      });
      res.status(200).json({
        message: "Data antrian farmasi berhasil ditampilkan",
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async processRegistration(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      const token = req.headers.authorization;

      await DataAntrianService.processRegistration({
        faskesUuid,
        token,
        body: req.body,
      });

      res
        .status(200)
        .json({
          message: "Proses antrian berhasil dibuat.",
        });
    } catch (err) {
      next(err);
    }
  }

}


