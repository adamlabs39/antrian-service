import { CodeGenerator } from "../helpers/code-generator.js";

export class AdmissionRJRepository {
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
