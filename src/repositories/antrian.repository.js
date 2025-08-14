import { Op, Sequelize } from "sequelize";
import moment from "moment";
import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";

export class AntrianRepository {
  static async countTodayByJadwal({ faskesUuid, jadwalDokterUuid }) {
    const startOfDayUnix = moment().startOf("day").unix();
    const endOfDayUnix = moment().endOf("day").unix();

    return await RawatJalanModel.count({
      where: {
        faskesUuid,
        jadwalDokterUuid,
        createdAt: {
          [Op.gte]: startOfDayUnix,
          [Op.lte]: endOfDayUnix,
        },
        noAntrianPoli: { [Op.ne]: null },
      },
    });
  }

  static async countTodayFarmasi({ faskesUuid, startDate, endDate }) {
    return await RawatJalanModel.count({
      where: {
        faskes_uuid: faskesUuid,
        no_antrian_farmasi: { [Op.ne]: null },
        created_at: {
          [Op.between]: [startDate, endDate], // Filter hari ini
        },
      },
    });
  }
}
