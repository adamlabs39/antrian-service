import { Op, Sequelize } from "sequelize";
import moment from "moment";
import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";
import AntrianModel from "../models/antrian.model.js";

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
        order: [["createdAt", "ASC"]],
      },
    });
  }

  static async countTodayByPelayanan({ faskesUuid, pelayanan,jenisResep, transaction }) {
    const todayStart = moment().startOf("day").unix();
    const todayEnd = moment().endOf("day").unix();

    return await AntrianModel.count({
      where: {
        pelayanan,
        jenisResep,
        faskesUuid,
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lt]: todayEnd,
        },
      },
      transaction,
    });
  }
}
