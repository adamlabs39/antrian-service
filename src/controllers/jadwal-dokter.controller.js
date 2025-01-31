import { JadwalDokterService } from "../services/jadwal-dokter.service.js";

export class JadwalDokterController {
  static async findAll(req, res, next) {
    try {
      const faskes_uuid = req.author.faskesUuid;
      const { result, paginationProperties } =
        await JadwalDokterService.findAll(faskes_uuid, req.body);

      res.status(200).json({
        message: "Data berhasil ditemukan",
        properties: paginationProperties,
        payload: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
