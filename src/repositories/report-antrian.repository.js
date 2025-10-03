import { Op } from "sequelize";
import ReportAntrianModel from "../models/report-antrian.model.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

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
        noAntrianTerakhir: 0,
        jumlahAntrianAktif: 0,
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
        jumlahAntrianAktif: {
          [Op.gt]: 0,
        },
        deletedAt: null,
      },
      transaction,
    });
    return count;
  }

  static async findReportByJadwalAndDate(
    jadwalDokterUuid,
    tanggalPelayanan,
    { transaction } = {}
  ) {
    const report = await ReportAntrianModel.findOne({
      where: {
        jadwalDokterUuid,
        tanggalPelayanan,
      },
      transaction,
    });
    return report;
  }
}
