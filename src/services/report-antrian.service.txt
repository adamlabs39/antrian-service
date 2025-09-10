import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";

export class ReportAntrianService {
  static async cancelBooking({ jadwalDokterUuid, tanggalPelayanan }) {
    // kuota sisa bertambah 1
    return await ReportAntrianRepository.updateKuotaSisa({
      jadwalDokterUuid,
      tanggalPelayanan,
      increment: 1,
    });
  }
}
