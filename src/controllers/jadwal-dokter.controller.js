import { JadwalDokterService } from "../services/jadwal-dokter.service.js";
export class JadwalDokterController {
  static async findAll(req, res, next) {
    try {
      // Kita asumsi bahwa faskesUuid sudah pasti ada karena sudah dihandle oleh auth middleware sdk
      const { faskesUuid } = req.author;
      const { pagination, data } = await JadwalDokterService.findAll(
        faskesUuid,
        req.query
      );

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        properties: pagination,
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async findOneByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await JadwalDokterService.findOneByDoctorAndLocation(
        faskesUuid,
        req.params
      );

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await JadwalDokterService.create(faskesUuid, req.body);
      res.status(201).json({
        message: "Data berhasil ditambahkan",
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await JadwalDokterService.updateByDoctorAndLocation(
        faskesUuid,
        req.params,
        req.body
      );

      res.status(200).json({
        message: "Data berhasil diupdate",
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }
}
