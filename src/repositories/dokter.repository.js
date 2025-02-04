import { PractitionerModel } from "@adameds/model-sdk/datamaster";

export class DokterRepository {
  static async findOneByUUID(faskes_uuid, practitioner_uuid) {
    const practitioner = await PractitionerModel.findByPk(practitioner_uuid, {
      raw: true,
      nest: true,
      paranoid: true,
    });

    if (
      practitioner &&
      practitioner.faskes_uuid === faskes_uuid &&
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
      },
    });
  }
}
