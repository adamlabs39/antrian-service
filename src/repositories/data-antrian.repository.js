import { Op, Sequelize } from "sequelize";
import AdmissionRJModel from "../models/admission-rj.model.js";
import AntrianModel from "../models/antrian.model.js";
import PencatatTaskIdModel from "../models/pencatat-task-id.model.js";

export class DataAntrianRepository {
  static async findAll({ faskesUuid, filterQuery }) {
    const whereClause = {
      faskesUuid,
      deletedAt: null,
    };
  }

  static async findAllAdmisi({ faskesUuid, filterQuery }) {
    const whereClause = {
      faskesUuid,
      deletedAt: null,
      statusPanggilan: [1, 2, 3, 4],
    };

    if (filterQuery.nama) {
      whereClause["$AdmissionRJ.name$"] = {
        [Op.iLike]: `%${filterQuery.nama}%`,
      };
    }

    if (filterQuery.batas_tanggal_awal || filterQuery.batas_tanggal_akhir) {
      whereClause["$AdmissionRJ.tanggal_daftar$"] = {
        ...(filterQuery.batas_tanggal_awal && {
          [Op.gte]: Math.floor(
            new Date(filterQuery.batas_tanggal_awal).getTime() / 1000
          ),
        }),
        ...(filterQuery.batas_tanggal_akhir && {
          [Op.lte]: Math.floor(
            new Date(filterQuery.batas_tanggal_akhir).getTime() / 1000
          ),
        }),
      };
    }

    if (filterQuery.status) {
      if (filterQuery.status === "antri") {
        whereClause["$AdmissionRJ.PencatatTaskIds.task_id$"] = 1;
      } else if (filterQuery.status === "proses") {
        whereClause["$AdmissionRJ.PencatatTaskIds.task_id$"] = 2;
      } else if (filterQuery.status === "selesai") {
        whereClause["$AdmissionRJ.PencatatTaskIds.task_id$"] = 3;
      }
    }

    const data = await AntrianModel.findAll({
      where: whereClause,
      raw: true,
      nest: true,
      subQuery: false,
      attributes: [
        ["uuid", "antrianUuid"],
        [Sequelize.col("AdmissionRJ.tanggal_daftar"), "waktuDaftar"],
        [
          Sequelize.col("AdmissionRJ.PencatatTaskIds.created_at"),
          "waktuKunjung",
        ],
        [Sequelize.col("AdmissionRJ.kode_booking"), "kodeBooking"],
        [Sequelize.col("AdmissionRJ.PencatatTaskIds.task_id"), "taskId"],
        [Sequelize.col("AdmissionRJ.no_antrian_admisi"), "noAntrianAdmisi"],
        [Sequelize.col("AdmissionRJ.name"), "namaPasien"],
        [Sequelize.col("AdmissionRJ.no_rm"), "noRm"],
        ["jenis_pasien", "jenisPasien"],
      ],
      include: [
        {
          model: AdmissionRJModel,
          required: true,
          include: [
            {
              model: PencatatTaskIdModel,
              required: false,
              where: {
                deletedAt: null,
                faskesUuid,
                taskId: [1, 2, 3],
              },
            },
          ],
          where: {
            faskesUuid,
            deletedAt: null,
          },
        },
      ],
    });

    const readableData = data.map((item) => {
      return {
        antrianUuid: item.antrianUuid,
        waktuDaftar: item.waktuDaftar,
        waktuKunjung: item.waktuKunjung,
        kodeBooking: item.kodeBooking,
        status: ["Antri", "Proses", "Selesai"][item.taskId - 1],
        noAntrianAdmisi: item.noAntrianadmisi,
        namaPasien: item.namaPasien,
        noRm: item.noRm,
        jenisPasien: item.jenisPasien === "JKN" ? "BPJS" : "Tunai",
      };
    });

    return {
      pagination: null,
      data: readableData,
    };
  }

  static async findAllRawatJalan({ faskesUuid, filterQuery }) {}
}
