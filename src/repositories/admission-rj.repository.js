import { CodeGenerator } from "../helpers/code-generator.js";
import { Op } from "sequelize";
import moment from "moment";
import AdmissionRJModel  from "../models/admission-rj.model.js";


export class AdmissionRJRepository {
  
  static async countByJadwalDokterUuidsForToday({
    faskesUuid,
    jadwalDokterUuids,
    transaction,
  }) {
    return await AdmissionRJModel.count({
      where: {
        faskesUuid,
        jadwalDokterUuid: {
          [Op.in]: jadwalDokterUuids,
        },
        tanggalDaftar: {
          [Op.gte]: moment().startOf("day").unix(),
          [Op.lte]: moment().endOf("day").unix(),
        },
        deletedAt: null,
      },
      transaction,
    });
  }
  
  static async findOneByNoIdentity({ faskesUuid, noIdentity }) {
    return AdmissionRJModel.findOne({
      raw: true,
      nest: true,
      where: {
        faskesUuid,
        noIdentity,
        deletedAt: null,
      },
    });
  }

  static async generateNoRm({ faskesUuid }) {
    // This generate is nto considered slow because the collision is very rare
    // No need to optimize
    while (true) {
      const noRm = CodeGenerator.generateNoRm();
      const admission = await AdmissionRJModel.findOne({
        where: {
          faskesUuid,
          noRm,
          deletedAt: null,
        },
      });

      if (!admission) {
        return noRm;
      }
    }
  }

  static async generateKodeBooking({ faskesUuid }) {
    // This generate is nto considered slow because the collision is very rare
    // No need to optimize
    while (true) {
      const kodeBooking = CodeGenerator.generateKodeBooking();
      const admission = await AdmissionRJModel.findOne({
        where: {
          faskesUuid,
          kodeBooking,
          deletedAt: null,
        },
      });

      if (!admission) {
        return kodeBooking;
      }
    }
  }
}
