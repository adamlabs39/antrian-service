import { Op, Sequelize } from "sequelize";
import "../models/associations.js";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import {
  PractitionerModel,
  PegawaiModel,
  LokasiModel,
} from "@adameds/model-sdk/datamaster";

export class JadwalDokterRepository {
  /**
   *
   * @TODO : Implement pagination (DONE)
   * @TODO : return also the status of each jadwal returned. (NOT YET )
   * @TODO : return also the spesialis for each dokter returned. (NOT YET)
   */
  static async findAll(faskes_uuid, filterQuery, page = 2, pageSize = 2) {
    const whereClause = {
      faskes_uuid,
      is_doctor: true,
    };

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    if (filterQuery.dokter) {
      whereClause["$pegawai.name$"] = {
        [Op.iLike]: `%${filterQuery.dokter}%`,
      };
    }

    /**
     *
     */
    if (filterQuery.poli) {
      whereClause["$jadwal_dokter.lokasi.name$"] = {
        [Op.iLike]: `%${filterQuery.poli}%`,
      };
    }

    if (filterQuery.aktif !== undefined) {
      whereClause["$jadwal_dokter.status$"] = filterQuery.aktif;
    }

    const { count, rows: result } = await PractitionerModel.findAndCountAll({
      limit,
      offset,
      attributes: [
        // Get the uuid - group by this
        "uuid",

        // Get the location name - group by this
        [Sequelize.col("jadwal_dokter.lokasi.name"), "lokasi_name"],

        // Get the name - dont group by this
        [
          Sequelize.fn("ANY_VALUE", Sequelize.col("pegawai.name")),
          "pegawai_name",
        ],

        // Get the location name - dont group by this
        [
          Sequelize.fn("ANY_VALUE", Sequelize.col("jadwal_dokter.status")),
          "status",
        ],

        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.uuid")),
          "jadwal_dokter_ids",
        ],
        [
          Sequelize.literal(
            "array_agg(TO_CHAR(jadwal_dokter.start_time, 'HH24:MI'))"
          ),
          "jadwal_dokter_start_times",
        ],
        [
          Sequelize.literal(
            "array_agg(TO_CHAR(jadwal_dokter.end_time, 'HH24:MI'))"
          ),
          "jadwal_dokter_end_times",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.day")),
          "jadwal_dokter_days",
        ],
      ],
      include: [
        {
          model: PegawaiModel,
          as: "pegawai",
          attributes: [],
        },
        {
          model: JadwalDokterModel,
          as: "jadwal_dokter",
          attributes: [],
          required: true,
          include: {
            model: LokasiModel,
            as: "lokasi",
            attributes: [],
            where: {
              is_poli: true,
            },
          },
        },
      ],
      where: whereClause,
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.name"],
      raw: true,
      nest: true,
      paranoid: true,
      subQuery: false,
    });

    const ret = result.map((row) => ({
      doctor_uuid: row.uuid,
      is_doctor: row.is_doctor,
      doctor_name: row.pegawai_name,
      poli: row.lokasi_name,
      jadwal_dokter: row.jadwal_dokter_ids.map((uuid, index) => ({
        jadwal_dokter_uuid: uuid,
        day: row.jadwal_dokter_days[index],
        start_time: row.jadwal_dokter_start_times[index],
        end_time: row.jadwal_dokter_end_times[index],
      })),
    }));

    return {
      pagination: {
        page,
        pageSize,
        maxPage: Math.ceil(count.length / pageSize),
      },
      data: ret,
    };
  }
}
