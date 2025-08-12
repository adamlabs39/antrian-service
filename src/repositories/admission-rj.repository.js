import { CodeGenerator } from "../helpers/code-generator.js";
import { Op } from "sequelize";
import moment from "moment";
import AdmissionRJModel  from "../models/admission-rj.model.js";


export class AdmissionRJRepository {
  static async create(dataToCreate, { transaction }) {
    // Menyimpan satu data pendaftaran baru.
    return await AdmissionRJModel.create(dataToCreate, { transaction });
  }

  static async update(dataToUpdate, { where, transaction }) {
    // Memperbarui data pendaftaran yang sudah ada.
    return await AdmissionRJModel.update(dataToUpdate, { where, transaction });
  }

  static async findOrCreateAdmissionForToday(
    { faskesUuid, patientUuid, defaults },
    { transaction }
  ) {
    const todayStart = moment().startOf("day").unix();
    const todayEnd = moment().endOf("day").unix();

    const [admission, created] = await AdmissionRJModel.findOrCreate({
      where: {
        faskesUuid,
        patientUuid,
        tanggalDaftar: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd,
        },
      },
      defaults: defaults,
      transaction,
    });

    return admission;
  }

  static async generateNoUrutRegistrasi({ faskesUuid, transaction }) {
    // Menghitung total registrasi hari ini untuk membuat No Registrasi.
    const count = await AdmissionRJModel.count({
      where: {
        faskesUuid,
        tanggalDaftar: {
          [Op.gte]: moment().startOf("day").unix(),
          [Op.lte]: moment().endOf("day").unix(),
        },
      },
      transaction,
    });
    return count + 1;
  }

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
    const totalPasien = await AdmissionRJModel.count({
      where: { faskesUuid },
      transaction,
    });
    const nomorUrutBerikutnya = totalPasien + 1;

     const noRm = CodeGenerator.generateNoRm(nomorUrutBerikutnya);

     return noRm;
  }

  static async generateKodeBooking({ faskesUuid }) {
    // This generate is nto considered slow because the collision is very rare
    // No need to optimize
    while (true) {
      const kodeBooking = CodeGenerator.kodeBooking();
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
