import { ReportAntrianService } from "../services/report-antrian.service.js";

export class ReportAntrianController {

  static async cancelBookingFromMobile(req, res, next) {
    try {
      const result = await ReportAntrianService.cancelBookingFromMobile(
        req.body
      );

      return res.json({
        success: true,
        message: "Proses pembatalan booking berhasil dijalankan.",
        data: {
          jumlah_antrian_aktif: result.jumlahAntrianAktif,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
