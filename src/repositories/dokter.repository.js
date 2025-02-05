import { PractitionerModel } from "@adameds/model-sdk/datamaster";

export class DokterRepository {
  static async findOneByUUID({ faskesUuid, dokterUuid, transaction }) {
    const practitioner = await PractitionerModel.findByPk(dokterUuid, {
      raw: true,
      nest: true,
      where: {
        faskesUuid,
        deletedAt: null,
      },
      transaction,
    });

    if (
      practitioner &&
      practitioner.faskes_uuid === faskesUuid &&
      practitioner.is_doctor
    ) {
      return practitioner;
    }

    return null;
  }

  static async findOneByCodeAntrian(faskes_uuid, code_antrian_dokter) {
    return await PractitionerModel.findOne({
      raw: true,
      nest: true,
      paranoid: true,
      where: {
        code_antrian_dokter,
        faskes_uuid,
        is_doctor: true,
        deletedAt: null,
      },
    });
  }
}
