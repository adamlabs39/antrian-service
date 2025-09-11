import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

export class ReportAntrianService {
  /**
   * Menangani logika pembatalan booking dengan mengurangi jumlah antrian aktif.
   * @param {{jadwalDokterUuid: string, tanggalPelayanan: string}}
   * @returns {Promise<ReportAntrianModel>}
   */
  static async cancelBooking({ jadwalDokterUuid, tanggalPelayanan }) {
    // 1. Cari laporan antrian yang sesuai menggunakan repository
    const report = await ReportAntrianRepository.findReportByJadwalAndDate(
      jadwalDokterUuid,
      tanggalPelayanan
    );

    // 2. Jika tidak ada report untuk jadwal/tanggal itu, berarti tidak ada yang bisa dibatalkan
    if (!report) {
      throw new NotFoundException(
        "Laporan antrian untuk jadwal dan tanggal ini tidak ditemukan."
      );
    }

    // 3. Lakukan pengurangan hanya jika ada antrian yang aktif
    if (report.jumlahAntrianAktif > 0) {
      report.jumlahAntrianAktif -= 1; // Kurangi 1
      await report.save(); // Simpan perubahan ke database
    }

    // 4. Kembalikan data report yang sudah terupdate
    return report;
  }
}
