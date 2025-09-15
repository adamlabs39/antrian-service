import { FormatterService } from "./formatter.service.js";
import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { AdmisiClient } from "../clients/admisi.client.js";

export class ReportAntrianService {

  static async cancelBookingFromMobile(requestBody) {
    console.log("Request Body:", requestBody);
    const camelCaseBody = FormatterService.toCamelCase(requestBody);
    const { jadwalDokterUuid, jadwalPeriksa, kodeBooking, faskesUuid } =
      camelCaseBody;

    if (!jadwalDokterUuid || !jadwalPeriksa || !kodeBooking || !faskesUuid) {
      throw new BadRequestException(
        "jadwal_dokter_uuid, jadwal_eriksa, kode_booking, dan faskes_uuid wajib diisi."
      );
    }

    const tanggalPelayanan = jadwalPeriksa;
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;

    const report = await ReportAntrianRepository.findReportByJadwalAndDate(
      jadwalDokterUuid,
      tanggalPelayanan
    );

    if (!report || report.jumlahAntrianAktif <= 0) {
      await AdmisiClient.cancelBookingMobile(
        { kodeBooking, faskesUuid },
        admisiApiKey
      );
      return {
        message:
          "Booking di Admisi dibatalkan (tidak ada kuota aktif di Antrian).",
      };
    }

    report.jumlahAntrianAktif -= 1;
    await report.save();

    try {
      await AdmisiClient.cancelBookingMobile(
        { kodeBooking, faskesUuid },
        admisiApiKey
      );

      return report;
    } catch (error) {
      console.error(
        "Gagal membatalkan di Admisi, mengembalikan kuota antrian..."
      );
      report.jumlahAntrianAktif += 1;
      await report.save();
      throw error;
    }
  }
}
