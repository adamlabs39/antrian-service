import { Op, Sequelize } from "sequelize";
import "../models/associations.js";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import {
  PractitionerModel,
  PegawaiModel,
  LokasiModel,
} from "@adameds/model-sdk/datamaster";
import moment from "moment";
import { FormatterService } from "../services/formatter.service.js";
import { ToIndoDay } from "../helpers/to-indo-day.js";

export class JadwalDokterRepository {
  static _buildCommonQueryOptions() {
    return {
      attributes: [
        // Get the uuid - group by this
        "uuid",

        // Get the code_antrian_dokter
        "code_antrian_dokter",

        // Get the code_antrian_poli
        [
          Sequelize.fn(
            "MAX",
            Sequelize.col("jadwal_dokter.lokasi.code_antrian_poli")
          ),
          "code_antrian_poli",
        ],

        // Get the location name - dont group by this
        [
          Sequelize.fn("MAX", Sequelize.col("jadwal_dokter.lokasi.name")),
          "lokasi_name",
        ],

        // Get the location uuid - group by this
        [Sequelize.col("jadwal_dokter.lokasi.uuid"), "lokasi_uuid"],

        // Get the name - dont group by this
        [Sequelize.fn("MAX", Sequelize.col("pegawai.name")), "pegawai_name"],

        // Get the location name - dont group by this
        [
          Sequelize.fn("BOOL_OR", Sequelize.col("jadwal_dokter.status")),
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
        [
          Sequelize.literal(
            `array_agg(
      COALESCE(
        (SELECT "jumlah_antrian_aktif"
         FROM "report_antrian"
         WHERE "report_antrian"."jadwal_dokter_uuid" = "jadwal_dokter"."uuid"
         AND "report_antrian"."tanggal_pelayanan" = CURRENT_DATE),
        0
      )
    )`
          ),
          "jadwal_dokter_terdaftar",
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
              deletedAt: null,
            },
          },
          where: {
            deletedAt: null,
          },
        },
      ],
    };
  }

  static async findAll({ faskesUuid, filters, page, pageSize }) {
    const whereClause = {
      faskes_uuid: faskesUuid,
      is_doctor: true,
      deletedAt: null,
    };

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    if (filters.dokter) {
      whereClause["$pegawai.name$"] = {
        [Op.iLike]: `%${filters.dokter}%`,
      };
    }

    if (filters.poli) {
      whereClause["$jadwal_dokter.lokasi.name$"] = {
        [Op.iLike]: `%${filters.poli}%`,
      };
    }

    if (filters.doctor_uuid) {
      whereClause.uuid = filters.doctor_uuid;
    }

    if (filters.poli_uuid) {
      whereClause["$jadwal_dokter.lokasi.uuid$"] = filters.poli_uuid;
    }

    if (filters.aktif !== undefined) {
      whereClause["$jadwal_dokter.status$"] = filters.aktif;
    }

    const commonOptions = this._buildCommonQueryOptions();

    const { count, rows: result } = await PractitionerModel.findAndCountAll({
      ...commonOptions,
      limit,
      offset,
      where: whereClause,
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.uuid"],
      order: [
        [Sequelize.fn("MIN", Sequelize.col("jadwal_dokter.created_at")), "ASC"],
      ],
      raw: true,
      nest: true,
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
      jadwal_dokter: row.jadwal_dokter_ids.map((uuid, index) => {
        const total_kuota = row.jadwal_dokter_kuotas[index];
        const jumlah_terdaftar = row.jadwal_dokter_terdaftar[index];

        return {
          jadwal_dokter_uuid: uuid,
          day: row.jadwal_dokter_days[index],
          start_time: row.jadwal_dokter_start_times[index],
          end_time: row.jadwal_dokter_end_times[index],
          kuota_jkn: row.jadwal_dokter_kuotajkns[index],
          kuota_non_jkn: row.jadwal_dokter_kuotanonjkns[index],
          total_kuota: total_kuota,
          sisa_kuota: total_kuota - jumlah_terdaftar,
          durasi_pelayanan: row.jadwal_dokter_durasi_pelayanans[index],
          status: row.jadwal_dokter_statuses[index] ? "aktif" : "non aktif",
        };
      }),
    }));

    return {
      pagination: {
        page,
        pageSize,
        total: count.length,
      },
      data: ret,
    };
  }

  static async findAllWithoutPagination({ faskesUuid, filters }) {
    const whereClause = {
      faskes_uuid: faskesUuid,
      is_doctor: true,
      deletedAt: null,
    };

    if (filters.dokter) {
      whereClause["$pegawai.name$"] = { [Op.iLike]: `%${filters.dokter}%` };
    }
    if (filters.poli) {
      whereClause["$jadwal_dokter.lokasi.name$"] = {
        [Op.iLike]: `%${filters.poli}%`,
      };
    }
    if (filters.doctor_uuid) {
      whereClause.uuid = filters.doctor_uuid;
    }
    if (filters.poli_uuid) {
      whereClause["$jadwal_dokter.lokasi.uuid$"] = filters.poli_uuid;
    }
    if (filters.aktif !== undefined) {
      whereClause["$jadwal_dokter.status$"] = filters.aktif;
    }

    const commonOptions = this._buildCommonQueryOptions();

    const queryOptions = {
      ...commonOptions,
      where: whereClause,
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.uuid"],
      order: [
        [Sequelize.fn("MIN", Sequelize.col("jadwal_dokter.created_at")), "ASC"],
      ],
      raw: true,
      nest: true,
      subQuery: false,
    };

    const { rows: result } = await PractitionerModel.findAndCountAll(
      queryOptions
    );

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
      jadwal_dokter: row.jadwal_dokter_ids.map((uuid, index) => {
        const total_kuota = row.jadwal_dokter_kuotas[index];
        const jumlah_terdaftar = row.jadwal_dokter_terdaftar[index];

        return {
          jadwal_dokter_uuid: uuid,
          day: row.jadwal_dokter_days[index],
          start_time: row.jadwal_dokter_start_times[index],
          end_time: row.jadwal_dokter_end_times[index],
          kuota: total_kuota,
          kuota_terisi: jumlah_terdaftar,
          sisa_kuota: total_kuota - jumlah_terdaftar,
          kuota_jkn: row.jadwal_dokter_kuotajkns[index],
          kuota_non_jkn: row.jadwal_dokter_kuotanonjkns[index],
          durasi_pelayanan: row.jadwal_dokter_durasi_pelayanans[index],
          status: row.jadwal_dokter_statuses[index] ? "aktif" : "non aktif",
        };
      }),
    }));

    return ret;
  }

  static async findAllByDoctorAndLocation({
    faskesUuid,
    dokterUuid,
    poliUuid,
    transaction,
  }) {
    const commonOptions = this._buildCommonQueryOptions();
    const row = await PractitionerModel.findOne({
      ...commonOptions,
      where: {
        faskes_uuid: faskesUuid,
        is_doctor: true,
        uuid: dokterUuid,
        "$jadwal_dokter.lokasi.uuid$": poliUuid,
        deletedAt: null,
      },
      group: ["PractitionerModel.uuid", "jadwal_dokter.lokasi.uuid"],
      raw: true,
      nest: true,
      transaction,
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

  static async findScheduleByUuid(uuid) {
    return await JadwalDokterModel.findOne({
      where: {
        uuid,
        deletedAt: null,
        status: true,
      },
      raw: true,
    });
  }

  static async findJadwalByUuid(uuid) {
    return await JadwalDokterModel.findOne({
      where: {
        uuid,
        deletedAt: null,
        status: true,
      },
      include: [
        {
          model: LokasiModel,
          as: "lokasi",
          attributes: ["code_antrian_poli", "name"],
        },
        {
          model: PractitionerModel,
          as: "practitioner",
          attributes: ["code_antrian_dokter", "uuid"],
          include: [
            {
              model: PegawaiModel,
              as: "pegawai",
              attributes: ["name"],
            },
          ],
        },
      ],
    });
  }

  static async findTodayScheduleByDoctorAndLocation({
    faskesUuid,
    dokterUuid,
    poliUuid,
    transaction,
  }) {
    const todayInIndonesian = ToIndoDay.fromEng(moment().format("dddd"));

    return await JadwalDokterModel.findOne({
      where: {
        faskesUuid,
        practitionerUuid: dokterUuid,
        lokasiUuid: poliUuid,
        day: todayInIndonesian,
        deletedAt: null,
        status: true,
      },
      transaction,
    });
  }

  static async create({ faskesUuid, jadwalDokter }) {
    const toBeCreated = jadwalDokter.jadwal.map((jadwal) => ({
      practitionerUuid: jadwalDokter.dokter_uuid,
      lokasiUuid: jadwalDokter.poliklinik_uuid,
      faskesUuid,
      day: jadwal.day,
      start_time: jadwal.start_time,
      end_time: jadwal.end_time,
      kuota: jadwal.kuota,
      kuotaNonJkn: jadwal.kuota_non_jkn,
      kuotaJkn: jadwal.kuota_jkn,
      durasiPelayanan: jadwal.durasi_pelayanan,
      codeAntrianDokter: jadwalDokter.code_antrian_dokter,
      codeAntrianPoli: jadwalDokter.code_antrian_poli,
      status: jadwal.aktif,
    }));

    const returning = await JadwalDokterModel.bulkCreate(toBeCreated, {
      returning: true,
    });

    return returning;
  }

  static async bulkDelete({ faskesUuid, UUIDsToBeDeleted, transaction }) {
    await JadwalDokterModel.update(
      { deletedAt: moment().unix() },
      {
        where: {
          faskes_uuid: faskesUuid,
          uuid: UUIDsToBeDeleted,
          deletedAt: null,
        },
        transaction,
      }
    );
  }

  /**
   * Bulk update schedules using CASE statements
   */
  static async bulkUpdate({
    faskesUuid,
    jadwalDokterToBeUpdated,
    transaction,
  }) {
    if (jadwalDokterToBeUpdated.length === 0) return [];

    const { sequelize } = JadwalDokterModel;
    const uuidList = jadwalDokterToBeUpdated.map((j) => j.jadwalDokterUuid);

    const fieldMap = {
      day: "day",
      start_time: "startTime",
      end_time: "endTime",
      durasiPelayanan: "durasiPelayanan",
      kuota: "kuota",
      kuotaJkn: "kuotaJkn",
      kuotaNonJkn: "kuotaNonJkn",
      codeAntrianPoli: "codeAntrianPoli",
      codeAntrianDokter: "codeAntrianDokter",
      status: "aktif",
    };

    const updatePayload = {
      updatedAt: moment().unix(),
    };

    Object.entries(fieldMap).forEach(([modelField, inputField]) => {
      const cases = jadwalDokterToBeUpdated
        .map((jadwal) => {
          const value = jadwal[inputField];
          if (value === undefined) return null;
          return `WHEN uuid = ${sequelize.escape(
            jadwal.jadwalDokterUuid
          )} THEN ${sequelize.escape(value)}`;
        })
        .filter(Boolean)
        .join(" ");

      if (cases) {
        updatePayload[modelField] = sequelize.literal(
          `(CASE ${cases} ELSE "${FormatterService.camelToSnake(
            modelField
          )}" END)`
        );
      }
    });

    return JadwalDokterModel.update(updatePayload, {
      where: {
        faskes_uuid: faskesUuid,
        uuid: { [Op.in]: uuidList },
        deletedAt: null,
      },
      transaction,
    });
  }

  /**
   * Bulk create new schedules
   */
  static async bulkCreate({
    faskesUuid,
    jadwalDokterToBeCreated,
    transaction,
  }) {
    if (jadwalDokterToBeCreated.length === 0) return [];

    const createPayload = jadwalDokterToBeCreated.map((j) => ({
      faskesUuid: faskesUuid,
      practitionerUuid: j.dokterUuid,
      lokasiUuid: j.poliklinikUuid,
      day: j.day,
      start_time: j.startTime,
      end_time: j.endTime,
      durasiPelayanan: j.durasiPelayanan,
      kuota: j.kuotaJkn + j.kuotaNonJkn,
      kuotaJkn: j.kuotaJkn,
      kuotaNonJkn: j.kuotaNonJkn,
      codeAntrianPoli: j.codeAntrianPoli,
      codeAntrianDokter: j.codeAntrianDokter,
      status: j.aktif,
      createdAt: moment().unix(),
    }));

    return JadwalDokterModel.bulkCreate(createPayload, {
      transaction,
    });
  }

  static async deleteAllByDoctorAndLocation({
    faskesUuid,
    dokterUuid,
    poliUuid,
    transaction,
  }) {
    await JadwalDokterModel.update(
      { deletedAt: moment().unix() },
      {
        where: {
          faskes_uuid: faskesUuid,
          practitionerUuid: dokterUuid,
          lokasiUuid: poliUuid,
          deletedAt: null,
        },
        transaction,
      }
    );
  }

  // FOR MOBILE
  static async findAllSchedulesByDay({
    faskesUuid,
    dokterUuid,
    poliUuid,
    day,
  }) {
    return await JadwalDokterModel.findAll({
      where: {
        faskesUuid,
        practitionerUuid: dokterUuid,
        lokasiUuid: poliUuid,
        day: day,
        status: true,
        deletedAt: null,
      },

      include: [
        {
          model: PractitionerModel,
          as: "practitioner",
          include: { model: PegawaiModel, as: "pegawai" },
        },
        {
          model: LokasiModel,
          as: "lokasi",
        },
      ],
    });
  }
}
