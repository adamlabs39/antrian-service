import { ReportAntrianService } from "../services/report-antrian.service.js";

export class ReportAntrianController {
  // static async cancelBooking(req, res, next) {
  //   try {
  //     const result = await ReportAntrianService.cancelBooking(req.body);

  //     return res.json({
  //       success: true,
  //       message: "Jumlah antrian aktif berhasil diperbarui.",
  //       data: {
  //         jumlah_anntrian_aktif: result.jumlahAntrianAktif,
  //       },
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

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
