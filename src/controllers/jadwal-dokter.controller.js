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
}
