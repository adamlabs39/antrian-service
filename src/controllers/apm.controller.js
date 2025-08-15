import { APMService } from "../services/apm.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class APMController {
  static async checkPatientStatus(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      // Meneruskan permintaan ke service
      const result = await APMService.checkPatientStatus({
        // faskesUuid,
        body: req.body,
        token,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async registerPatient(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      // Meneruskan semua data pendaftaran ke service
      const result = await APMService.registerPatient({
        faskesUuid,
        body: req.body,
        token,
      });

      res.status(201).json(result); // Kirim kembali respons dari service
    } catch (err) {
      next(err);
    }
  }

  static async checkIn(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      const result = await APMService.checkIn({
        faskesUuid,
        body: req.body, // Berisi kode_booking
        token,
      });

      res.status(200).json({
        message: "Check-in berhasil",
        payload: result,
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
        message: "Data jadwal berhasil ditampilkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }
}
