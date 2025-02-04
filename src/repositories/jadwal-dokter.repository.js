import { Op, Sequelize } from "sequelize";
import "../models/associations.js";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import {
  PractitionerModel,
  PegawaiModel,
  LokasiModel,
} from "@adameds/model-sdk/datamaster";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class JadwalDokterRepository {
  /**
   *
   * @TODO : Implement pagination (DONE)
   * @TODO : return also the status of each jadwal returned. (DONE)
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

        // Get the code_antrian_dokter
        "code_antrian_dokter",

        // Get the code_antrian_poli
        [
          Sequelize.fn(
            "ANY_VALUE",
            Sequelize.col("jadwal_dokter.lokasi.code_antrian_poli")
          ),
          "code_antrian_poli",
        ],

        // Get the location name - dont group by this
        [
          Sequelize.fn("ANY_VALUE", Sequelize.col("jadwal_dokter.lokasi.name")),
          "lokasi_name",
        ],

        // Get the location uuid - group by this
        [Sequelize.col("jadwal_dokter.lokasi.uuid"), "lokasi_uuid"],

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
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.kuota")),
          "jadwal_dokter_kuotas",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.kuota_jkn")),
          "jadwal_dokter_kuotajkns",
        ],
        [
          Sequelize.fn(
            "array_agg",
            Sequelize.col("jadwal_dokter.kuota_non_jkn")
          ),
          "jadwal_dokter_kuotanonjkns",
        ],
        [
          Sequelize.fn(
            "array_agg",
            Sequelize.col("jadwal_dokter.durasi_pelayanan")
          ),
          "jadwal_dokter_durasi_pelayanans",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.status")),
          "jadwal_dokter_statuses",
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
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.uuid"],
      raw: true,
      nest: true,
      paranoid: true,
      subQuery: false,
    });

    const ret = result.map((row) => ({
      doctor: {
        kode_antrian: row.code_antrian_dokter,
        name: row.pegawai_name,
        uuid: row.uuid,
      },

      poli: {
        kode_antrian: row.code_antrian_poli,
        name: row.lokasi_name,
        uuid: row.lokasi_uuid,
      },
      jadwal_dokter: row.jadwal_dokter_ids.map((uuid, index) => ({
        jadwal_dokter_uuid: uuid,
        day: row.jadwal_dokter_days[index],
        start_time: row.jadwal_dokter_start_times[index],
        end_time: row.jadwal_dokter_end_times[index],
        kuota: row.jadwal_dokter_kuotas[index],
        kuota_jkn: row.jadwal_dokter_kuotajkns[index],
        kuota_non_jkn: row.jadwal_dokter_kuotanonjkns[index],
        durasi_pelayanan: row.jadwal_dokter_durasi_pelayanans[index],
        status: row.jadwal_dokter_statuses[index] ? "aktif" : "non aktif",
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

  /**
   *
   */
  static async findOneByDoctorAndLocation(faskes_uuid, dokter_uuid, poli_uuid) {
    console.log("here");
    const row = await PractitionerModel.findOne({
      attributes: [
        // Get the uuid - group by this
        "uuid",

        "code_antrian_dokter",

        // Get the location name - dont group by this
        [
          Sequelize.fn("ANY_VALUE", Sequelize.col("jadwal_dokter.lokasi.name")),
          "lokasi_name",
        ],

        // Get the location uuid - group by this
        [Sequelize.col("jadwal_dokter.lokasi.uuid"), "lokasi_uuid"],
        [
          Sequelize.col("jadwal_dokter.lokasi.code_antrian_poli"),
          "code_antrian_poli",
        ],

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
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.kuota")),
          "jadwal_dokter_kuotas",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.kuota_jkn")),
          "jadwal_dokter_kuotajkns",
        ],
        [
          Sequelize.fn(
            "array_agg",
            Sequelize.col("jadwal_dokter.kuota_non_jkn")
          ),
          "jadwal_dokter_kuotanonjkns",
        ],
        [
          Sequelize.fn(
            "array_agg",
            Sequelize.col("jadwal_dokter.durasi_pelayanan")
          ),
          "jadwal_dokter_durasi_pelayanans",
        ],
        [
          Sequelize.fn("array_agg", Sequelize.col("jadwal_dokter.status")),
          "jadwal_dokter_statuses",
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
      where: {
        faskes_uuid,
        is_doctor: true,
        uuid: dokter_uuid,
        "$jadwal_dokter.lokasi.uuid$": poli_uuid,
      },
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.uuid"],
      raw: true,
      nest: true,
      paranoid: true,
    });

    return (
      row && {
        doctor: {
          uuid: row.uuid,
          name: row.pegawai_name,
          code_antrian_dokter: row.code_antrian_dokter,
        },
        poli: {
          uuid: row.lokasi_uuid,
          name: row.lokasi_name,
          code_antrian_poli: row.code_antrian_poli,
        },
        jadwal_dokter: row.jadwal_dokter_ids.map((uuid, index) => ({
          jadwal_dokter_uuid: uuid,
          day: row.jadwal_dokter_days[index],
          start_time: row.jadwal_dokter_start_times[index],
          end_time: row.jadwal_dokter_end_times[index],
          kuota: row.jadwal_dokter_kuotas[index],
          kuota_jkn: row.jadwal_dokter_kuotajkns[index],
          kuota_non_jkn: row.jadwal_dokter_kuotanonjkns[index],
          durasi_pelayanan: row.jadwal_dokter_durasi_pelayanans[index],
          status: row.jadwal_dokter_statuses[index] ? "aktif" : "non aktif",
        })),
      }
    );
  }

  static async create(faskes_uuid, data) {
    const toBeCreated = data.jadwal.map((jadwal) => ({
      practitionerUuid: data.dokter_uuid,
      lokasiUuid: data.poliklinik_uuid,
      faskesUuid: faskes_uuid,
      day: jadwal.day,
      start_time: jadwal.start_time,
      end_time: jadwal.end_time,
      kuota: jadwal.kuota_jkn + jadwal.kuota_non_jkn,
      kuotaNonJkn: jadwal.kuota_non_jkn,
      kuotaJkn: jadwal.kuota_jkn,
      durasiPelayanan: jadwal.durasi_pelayanan,
      codeAntrianDokter: data.code_antrian_dokter,
      codeAntrianPoli: data.code_antrian_poli,
      status: jadwal.aktif,
    }));

    const jadwalDokter = await JadwalDokterModel.bulkCreate(toBeCreated, {
      returning: true,
    });

    return jadwalDokter;
  }
}
