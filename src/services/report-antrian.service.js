import { FormatterService } from "./formatter.service.js";
import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class ReportAntrianService {

  static async cancelBooking(requestBody) {
    const camelCaseBody = FormatterService.toCamelCase(requestBody);
    const { jadwalDokterUuid, jadwalPeriksa } = camelCaseBody;
    const tanggalPelayanan = jadwalPeriksa;

    if (!jadwalDokterUuid || !tanggalPelayanan) {
      throw new BadRequestException(
        "jadwalDokterUuid dan tanggalPelayanan wajib diisi"
      );
    }

    const report = await ReportAntrianRepository.findReportByJadwalAndDate(
      jadwalDokterUuid,
      tanggalPelayanan
    );

    if (!report) {
      throw new NotFoundException(
        "Laporan antrian untuk jadwal dan tanggal ini tidak ditemukan."
      );
    }

    if (report.jumlahAntrianAktif > 0) {
      report.jumlahAntrianAktif -= 1;
      await report.save();
    }

    return report;
  }
}
