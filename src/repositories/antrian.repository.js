import { Op, Sequelize } from "sequelize";
import AdmissionRJModel from "../models/admission-rj.model.js";
import AntrianModel from "../models/antrian.model.js";
import PencatatTaskIdModel from "../models/pencatat-task-id.model.js";
import moment from "moment";

export class AntrianRepository {
  static async findAll({ faskesUuid, filters, page, pageSize, tipe }) {
    const whereClause = {
      faskesUuid,
      pelayanan: tipe, 
      deletedAt: null,
    };

    // Filter dinamis berdasarkan nama pasien
    if (filters.nama) {
      whereClause["$AdmissionRJ.name$"] = {
        [Op.iLike]: `%${filters.nama}%`,
      };
    }

    // Filter dinamis berdasarkan rentang tanggal
    if (filters.batas_tanggal_awal || filters.batas_tanggal_akhir) {
      whereClause["$AdmissionRJ.tanggal_daftar$"] = {
        ...(filters.batas_tanggal_awal && {
          [Op.gte]: moment(filters.batas_tanggal_awal).startOf("day").unix(),
        }),
        ...(filters.batas_tanggal_akhir && {
          [Op.lte]: moment(filters.batas_tanggal_akhir).endOf("day").unix(),
        }),
      };
    }

    // Filter dinamis berdasarkan status
    if (filters.status) {
      const statusMap = {
        panggil: 1,
        lewati: 2,
        proses: 3,
        selesai:4,
        verifikasi_obat: 5,
        penyerahan_obat: 6
      };
      if (statusMap[filters.status]) {
        whereClause["$AdmissionRJ.PencatatTaskIds.task_id$"] =
          statusMap[filters.status];
      }
    }

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await AntrianModel.findAndCountAll({
      limit,
      offset,
      where: whereClause,
      raw: true,
      nest: true,
      subQuery: false,
      attributes: [
        ["uuid", "antrianUuid"],
        [Sequelize.col("AdmissionRJ.tanggal_daftar"), "waktuDaftar"],
        [
          Sequelize.col("AdmissionRJ.PencatatTaskIds.created_at"),
          "waktuPanggil",
        ],
        [Sequelize.col("AdmissionRJ.kode_booking"), "kodeBooking"],
        [Sequelize.col("AdmissionRJ.PencatatTaskIds.task_id"), "taskId"],
        [Sequelize.col("AdmissionRJ.no_antrian_admisi"), "noAntrianAdmisi"],
        [Sequelize.col("AdmissionRJ.no_antrian_poli"), "noAntrianPoli"],
        [Sequelize.col("AdmissionRJ.name"), "namaPasien"],
        [Sequelize.col("AdmissionRJ.no_rm"), "noRm"],
        ["jenis_pasien", "jenisPasien"],
      ],
      include: [
        {
          model: AdmissionRJModel,  
          required: true,
          attributes: [], // Atribut tidak perlu diambil, hanya untuk JOIN
          include: [
            {
              model: PencatatTaskIdModel,
              required: false,
              attributes: [],
              where: {
                deletedAt: null,
                faskesUuid,
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

    const readableData = rows.map((item) => {
      return {
        antrianUuid: item.antrianUuid,
        waktuDaftar: item.waktuDaftar,
        waktuPanggil: item.waktuPanggil,
        kodeBooking: item.kodeBooking,
        status: ["panggil", "lewati", "proses", "selesai", "verifikasi_obat", "penyerahan_obat"][item.taskId - 1] || "unknown",
        noAntrianAdmisi: item.noAntrianAdmisi,
        noAntrianPoli: item.noAntrianPoli || null,
        namaPasien: item.namaPasien,
        noRm: item.noRm,
        jenisPasien: item.jenisPasien === "JKN" ? "NON JKN" : item.jenisPasien,
      };
    });

    return {
      pagination: { total: count, page, pageSize },
      data: readableData,
    };
  }

  static async generateNoUrutRegistrasi({ faskesUuid }) {
    const startOfDayUnix = moment().startOf("day").unix();
    const endOfDayUnix = moment().endOf("day").unix();

    const count = await AntrianModel.count({
      where: {
        faskesUuid,
        createdAt: {
          [Op.between]: [startOfDayUnix, endOfDayUnix],
        },
      },
    });

    return count + 1;
  }
}
