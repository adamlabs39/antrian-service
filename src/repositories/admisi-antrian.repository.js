import AntrianModel from "../models/antrian.model.js";
import { FormatterService } from "../services/formatter.service.js";

const antrianAttributes = [
  //   "uuid",
  "patient_uuid",
  "rawat_jalan_uuid",
  "status_panggilan",
  "pelayanan",
  "jenis_pasien",
  "pasien_baru",
];

export default class AdmisiAntrianRepository {
  static async create(data) {
    const newAntrian = await AntrianModel.create(data);

    return await this.findByUuid(newAntrian.uuid);
  }

  static async findByUuid(uuid) {
    const antrian = await AntrianModel.findByPk(uuid, {
      attributes: antrianAttributes,
    });

    if (!antrian) {
      return null;
    }

    const plainObject = antrian.get({ plain: true });
    return FormatterService.toSnakeCase(plainObject);
  }

  static async update(uuid, data) {
    await AntrianModel.update(data, { where: { uuid } });

    return await this.findByUuid(uuid);
  }
}
