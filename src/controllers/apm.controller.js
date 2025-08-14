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

  static async getAvailablePoliklinik(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getAvailablePoliklinik({ faskesUuid });

      res.status(200).json({
        message: "Data poliklinik berhasil ditampilkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mengambil daftar dokter yang tersedia di poliklinik tertentu.
   */
  static async getAvailableDokter(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getAvailableDokter({
        faskesUuid,
        params: req.params, // Mengirim poli_uuid
      });

      res.status(200).json({
        message: "Data dokter berhasil ditampilkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mengambil detail jadwal untuk dokter dan poli tertentu.
   */
  static async getJadwalDetail(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await APMService.getJadwalDetail({
        faskesUuid,
        params: req.params, // Mengirim dokter_uuid dan poli_uuid
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
