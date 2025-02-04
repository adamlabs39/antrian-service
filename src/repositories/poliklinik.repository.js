import { LokasiModel } from "@adameds/model-sdk/datamaster";

export class PoliklinikRepository {
  static async findOneByUUID(faskes_uuid, lokasi_uuid) {
    const lokasi = await LokasiModel.findByPk(lokasi_uuid, {
      raw: true,
      nest: true,
      paranoid: true,
    });

    if (lokasi && lokasi.faskes_uuid === faskes_uuid && lokasi.is_poli) {
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
      },
    });
  }
}
