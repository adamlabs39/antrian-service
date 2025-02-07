import { LokasiModel } from "@adameds/model-sdk/datamaster";

export class PoliklinikRepository {
  static async findOneByUUID({ faskesUuid, poliklinikUuid }) {
    const lokasi = await LokasiModel.findByPk(poliklinikUuid, {
      raw: true,
      nest: true,
      deletedAt: null,
    });
    console.log(lokasi);

    if (lokasi && lokasi.faskes_uuid === faskesUuid && lokasi.is_poli) {
      return lokasi;
    }

    return null;
  }

  static async findOneByCodeAntrian(faskes_uuid, code_antrian_poli) {
    return await LokasiModel.findOne({
      raw: true,
      nest: true,
      paranoid: true,
      where: {
        code_antrian_poli,
        faskes_uuid,
        is_poli: true,
        deletedAt: null,
      },
    });
  }

  static async findAllByPoliklinikUUIDs({ faskesUuid, poliklinikUuids }) {
    return await LokasiModel.findAll({
      raw: true,
      nest: true,
      where: {
        faskes_uuid: faskesUuid,
        uuid: poliklinikUuids,
        is_poli: true,
        deletedAt: null,
      },
    });
  }
}
