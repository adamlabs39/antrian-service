import { APMService } from "../services/apm.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class APMController {
  static async getDataByIdentity(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getDataByIdentity({
        faskesUuid,
        query: req.query,
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

  static async register(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.register({
        faskesUuid,
        data: req.body,
      });

      res.status(201).json({
        message: "Data berhasil ditambahkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      await APMService.checkIn({
        faskesUuid,
        params: req.params,
      });

      req.pa;

      res.status(200).json({
        message: "Data berhasil diupdate",
      });
    } catch (err) {
      next(err);
    }
  }

  async getByBookingCode(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getByBookingCode({
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

  static async getAvailableSchedule(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getAvailableSchedule({
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
}
