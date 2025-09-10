import { ReportAntrianService } from "../services/report-antrian.service.js";

export class ReportAntrianController {
  /**
   * Cancel booking → kuota sisa bertambah
   */
  static async cancelBooking(req, res, next) {
    try {
      const { jadwalDokterUuid, tanggalPelayanan } = req.body;

      if (!jadwalDokterUuid || !tanggalPelayanan) {
        return res.status(400).json({
          success: false,
          message: "jadwalDokterUuid dan tanggalPelayanan wajib diisi",
        });
      }

      const result = await ReportAntrianService.cancelBooking({
        jadwalDokterUuid,
        tanggalPelayanan,
      });

      return res.json({
        success: true,
        message: "Kuota sisa berhasil diupdate",
        data: {
          kuotaSisa: result.kuotaSisa,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
