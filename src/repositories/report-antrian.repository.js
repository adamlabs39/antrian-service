import { Op } from "sequelize";
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

  static async countBookedSchedules({ jadwalDokterUuids, transaction }) {
    const count = await ReportAntrianModel.count({
      where: {
        jadwalDokterUuid: {
          [Op.in]: jadwalDokterUuids,
        },
        kuotaTerpakai: {
          [Op.gt]: 0,
        },
        deletedAt: null,
      },
      transaction,
    });
    return count;
  }

  static async isPatientAlreadyBooked({
    patientIdentity, 
    jadwalDokterUuid,
    tanggalPelayanan,
    transaction,
  }) {
    const existing = await ReportAntrianModel.findOne({
      where: {
        jadwalDokterUuid,
        tanggalPelayanan,
        patientIdentity, // pastikan kolom ini ada di report_antrian
        deletedAt: null,
      },
      transaction,
    });

    return !!existing; // true kalau sudah ada
  }
}
