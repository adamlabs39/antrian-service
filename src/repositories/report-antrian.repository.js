import ReportAntrianModel from "../models/report-antrian.model.js";

export class ReportAntrianRepository {
  /**
   * Mencari atau membuat laporan untuk jadwal dan tanggal tertentu.
   */
  static async findOrCreateReport({
    jadwalDokter,
    tanggalPelayanan,
    transaction,
  }) {
    const [report, created] = await ReportAntrianModel.findOrCreate({
      where: {
        jadwalDokterUuid: jadwalDokter.uuid,
        tanggalPelayanan: tanggalPelayanan,
      },
      defaults: {
        faskesUuid: jadwalDokter.faskesUuid,
        practitionerName: jadwalDokter.practitioner.pegawai.name,
        locationName: jadwalDokter.lokasi.name,
        kuota: jadwalDokter.kuota,
        kuotaTerpakai: 0,
        kuotaSisa: jadwalDokter.kuota,
      },
      transaction,
    });
    return report;
  }


}
