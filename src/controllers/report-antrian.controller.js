import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ReportAntrianService } from "../services/report-antrian.service.js";

export class ReportAntrianController {
  /**
   * Mengurangi jumlah antrian aktif saat booking dibatalkan.
   */
  static async cancelBooking(req, res, next) {
    try {
      const { jadwalDokterUuid, tanggalPelayanan } = req.body;

      // Validasi input
      if (!jadwalDokterUuid || !tanggalPelayanan) {
        throw new BadRequestException(
          "jadwalDokterUuid dan tanggalPelayanan wajib diisi"
        );
      }

      const result = await ReportAntrianService.cancelBooking({
        jadwalDokterUuid,
        tanggalPelayanan,
      });
    
      // Pesan dan data respons disesuaikan dengan logika baru
      return res.json({
        success: true,
        message: "Jumlah antrian aktif berhasil diperbarui.",
        data: {
          jumlahAntrianAktif: result.jumlahAntrianAktif,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
