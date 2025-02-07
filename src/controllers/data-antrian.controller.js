import { DataAntrianService } from "../services/data-antrian.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class DataAntrianController {
  static async findAll(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const { pagination, data } = DataAntrianService.findAll({
        faskesUuid,
        filterQuery: req.body,
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
      const { pagination, data } = await DataAntrianService.findAllAdmisi({
        faskesUuid,
        filterQuery: req.query,
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
}
