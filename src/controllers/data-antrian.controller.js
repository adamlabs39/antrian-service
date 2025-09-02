import { DataAntrianService } from "../services/data-antrian.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class DataAntrianController {
  //fungsi untuk registrasi dari layanan apm dan mobile
  static async processRegistration(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      const token = req.headers.authorization;

      await DataAntrianService.processRegistration({
        faskesUuid,
        token,
        body: req.body,
      });

      res.status(200).json({
        message: "Proses antrian berhasil dibuat.",
      });
    } catch (err) {
      next(err);
    }
  }

  static async antrianFarmasi(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      await DataAntrianService.processAntrianFarmasi({
        faskesUuid,
        token,
        body: req.body,
      });

      res.status(200).json({
        message: "Proses antrian farmasi berhasil dibuat.",
      });
    } catch (err) {
      next(err);
    }
  }

  //fungsi untuk registrasi dari layanan admisi
  static async regisAdmisi(req, res, next) {
    try {
      const { jadwal_dokter_uuid } = req.body;
      if (!jadwal_dokter_uuid) {
        throw new BadRequestException(
          "jadwal_dokter_uuid wajib ada di dalam body request."
        );
      }

      const serviceParams = {
        faskesUuid: req.author.faskesUuid,
        token: req.headers.authorization,
        requestData: req.body,
        // isPasienBaru: false,
        // tanggalPelayanan: null,
      };

      const generatedCodes = await DataAntrianService.processAdmisiRegistration(
        serviceParams
      );

      res.status(200).json({
        message: "Nomor antrian berhasil digenerate.",
        payload: generatedCodes,
      });
    } catch (err) {
      next(err);
    }
  }
}
