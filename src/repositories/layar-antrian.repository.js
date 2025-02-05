import LayarAntrianModel from "../models/layar-antrian.model";

export class LayarAntrianRepository {
  static async findAll({ faskesUuid, filters, page, pageSize }) {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await LayarAntrianModel.findAndCountAll({
      limit,
      offset,
      exclude: [
        "deleted_at",
        "id",
        "uuid",
        "created_at",
        "updated_at",
        "faskes_uuid",
      ],
    });
  }
}
