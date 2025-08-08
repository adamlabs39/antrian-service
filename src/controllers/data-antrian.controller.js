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
      // Mengambil faskesUuid dari token yang sudah divalidasi
      const { faskesUuid } = req.author;

      // Mengambil token asli dari header untuk diteruskan ke service lain
      const token = req.headers.authorization;

      // Memanggil service untuk melakukan semua pekerjaan
      await DataAntrianService.processRegistration({
        faskesUuid,
        token,
        body: req.body,
      });

      // Mengirim respons sukses kembali ke layanan yang memicu
      res
        .status(200)
        .json({
          message: "Proses antrian berhasil dipicu dan data telah diupdate.",
        });
    } catch (err) {
      next(err);
    }
  }

  // static async generateCodes(req, res, next) {
  //   try {
  //     const { faskesUuid } = req.author;
  //     // Ambil token asli dari header untuk diteruskan
  //     const token = req.headers.authorization;

  //     const generatedCodes = await DataAntrianService.generateCodes({
  //       faskesUuid,
  //       requestData: req.body,
  //       token, // Teruskan token
  //     });

  //     res.status(200).json({
  //       message: "Kode berhasil di-generate",
  //       payload: generatedCodes,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // static async create(req, res, next) {
  //   try {
  //     const { faskesUuid } = req.author;
  //     const data = await DataAntrianService.create({
  //       faskesUuid,
  //       antrianData: req.body,
  //     });
  //     res.status(201).json({
  //       message: "Nomor antrian berhasil dibuat.",
  //       payload: data,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}


