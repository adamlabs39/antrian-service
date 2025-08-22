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

  static async regisAdmisi(req, res, next) {
    try {
      // 1. Validasi Input
      const { rawat_jalan_uuid } = req.body;
      if (!rawat_jalan_uuid) {
        throw new BadRequestException(
          "rawat_jalan_uuid wajib ada di dalam body request."
        );
      }

      // 2. Siapkan semua parameter yang dibutuhkan oleh DataAntrianService
      const serviceParams = {
        faskesUuid: req.author.faskesUuid,
        token: req.headers.authorization, 
        requestData: req.body, 

        // Parameter berikut tidak relevan untuk alur ADMISI, tapi bisa diisi nilai default
        isPasienBaru: false,
        tanggalPelayanan: null,
      };

      // 3. Panggil service untuk memproses dan mendapatkan hasilnya
      const generatedCodes = await DataAntrianService.processAdmisiRegistration(
        serviceParams
      );

      // 4. Kirim kembali nomor yang berhasil di-generate dan di-update
      res.status(200).json({
        message: "Nomor antrian berhasil digenerate dan diupdate.",
        payload: generatedCodes,
      });
    } catch (err) {
      next(err);
    }
  }
}


