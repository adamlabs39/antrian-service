import { FormatterService } from "../services/formatter.service.js";
import { LayarAntrianService } from "../services/layar-antrian.service.js";

export class LayarAntrianController {
  static async findAll(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      const { pagination, data } = await LayarAntrianService.findAll({
        faskesUuid,
        filterBy: req.query,
      });

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        properties: FormatterService.toSnakeCase(pagination),
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async findOne(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await LayarAntrianService.findOne({
        faskesUuid,
        params: req.params,
      });

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await LayarAntrianService.create({
        faskesUuid,
        layarAntrian: req.body,
      });

      res.status(201).json({
        message: "Data berhasil ditambahkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      await LayarAntrianService.update({
        faskesUuid,
        params: req.params,
        body: req.body,
      });

      res.status(200).json({
        message: "Data berhasil diupdate",
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      await LayarAntrianService.delete({
        faskesUuid,
        params: req.params,
      });

      res.status(200).json({
        message: "Data berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }
}
