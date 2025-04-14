import LayarAntrianPoliModel from "../models/layar-antrian-poli.model.js";
import moment from "moment"
export class LayarAntrianPoliRepository {
  static async bulkCreate({
    faskesUuid,
    layarAntrianUuid,
    poliklinikUuids,
    transaction,
  }) {
    const data = poliklinikUuids.map((poliklinikUuid) => ({
      faskesUuid: faskesUuid,
      layar_antrian_uuid: layarAntrianUuid,
      lokasi_uuid: poliklinikUuid,
    }));

    await LayarAntrianPoliModel.bulkCreate(data, { transaction });
  }

  static async bulkDelete({ faskesUuid, layarAntrianUuid, transaction }) {
    await LayarAntrianPoliModel.update(
      { deletedAt: moment().unix() },
      {
        where: {
          faskesUuid,
          layar_antrian_uuid: layarAntrianUuid,
          deletedAt: null,
        },
        transaction,
      }
    );
  }
}
