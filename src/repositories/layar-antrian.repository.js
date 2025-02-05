import LayarAntrianModel from "../models/layar-antrian.model.js";
import LayarAntrianPoliModel from "../models/layar-antrian-poli.model.js";
import { LokasiModel } from "@adameds/model-sdk/datamaster";
import { Op, Sequelize } from "sequelize";

export class LayarAntrianRepository {
  static async findAll({ faskesUuid, filters, page = 1, pageSize = 10 }) {
    const whereClause = {
      faskesUuid,
      deletedAt: null,
    };

    if (filters.nama) {
      whereClause[Op.or] = [
        {
          nama_layar: {
            [Op.iLike]: `%${filters.nama}%`,
          },
        },
        {
          judul: {
            [Op.iLike]: `%${filters.nama}%`,
          },
        },
      ];
    }

    if (filters.aktif !== undefined) {
      whereClause.status = filters.aktif;
    }

    if (filters.tipe_layar) {
      whereClause.tipe_layar = filters.tipe_layar;
    }

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await LayarAntrianModel.findAndCountAll({
      limit,
      offset,
      raw: true,
      nest: true,
      subQuery: false,
      attributes: [
        "uuid",
        "nama_layar",
        "tipe_layar",
        "judul",
        "is_admisi",
        "is_poli",
        "is_farmasi",
        "flash_text",
        "media",
        "status",
        [
          Sequelize.fn("array_agg", Sequelize.col("location.uuid")),
          "lokasi_uuids",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("location.name")),
          "lokasi_names",
        ],
      ],
      where: whereClause,
      include: [
        {
          model: LokasiModel,
          through: {
            model: LayarAntrianPoliModel,
            attributes: [],
            where: { deletedAt: null, faskesUuid },
          },
          as: "location",
          required: false,
          attributes: [],
          where: {
            faskes_uuid: faskesUuid,
            deletedAt: null,
          },
        },
      ],
      group: ["LayarAntrian.uuid"],
    });

    const formattedData = rows.map(
      ({ lokasi_uuids, lokasi_names, ...rest }) => {
        return {
          ...rest,
          lokasi: lokasi_uuids[0]
            ? lokasi_uuids.map((uuid, index) => ({
                uuid,
                name: lokasi_names[index],
              }))
            : [],
        };
      }
    );

    return {
      pagination: {
        total: count.length,
        page,
        pageSize,
      },
      data: formattedData,
    };
  }
}
