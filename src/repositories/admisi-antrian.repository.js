import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";
import AntrianModel from "../models/antrian.model.js";
import { FormatterService } from "../services/formatter.service.js";
import { PatientModel } from "@adameds/model-sdk/admisi";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import { Op } from "sequelize";

const antrianAttributes = [
  "uuid",
  "rawat_jalan_uuid",
  "status_panggilan",
  "pelayanan",
  "jenis_pasien",
  "pasien_baru",
  "jenis_resep",
];

export default class AdmisiAntrianRepository {
  static transform(antrian) {
    const plainObject = antrian.get({ plain: true });
    const snakeCase = FormatterService.toSnakeCase(plainObject);

    if (snakeCase.patient_data) {
      const patientData = snakeCase.patient_data;

      if (patientData.patient) {
        patientData.identity = patientData.patient.identity;
        patientData.no_identity = patientData.patient.no_identity;
        delete patientData.patient;
      }

      patientData.antrian = {
        kode_booking: patientData.kode_booking,
        no_antrian_admisi: patientData.no_antrian_admisi,
        no_antrian_poli: patientData.no_antrian_poli,
        no_antrian_farmasi: patientData.no_antrian_farmasi,
      };

      delete patientData.kode_booking;
      delete patientData.no_antrian_admisi;
      delete patientData.no_antrian_poli;
      delete patientData.no_antrian_farmasi;
    }

    return snakeCase;
  }

  static async findAll({ faskesUuid, filters, page, pageSize }) {
    console.log("nama yang dicari:", filters.name);
    const where = { faskes_uuid: faskesUuid };

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    if (
      filters.status_panggilan !== undefined &&
      filters.status_panggilan !== null &&
      filters.status_panggilan !== ""
    ) {
      where.status_panggilan = parseInt(filters.status_panggilan, 10);
    }
    const patientWhere = {};
    if (filters.start_date && filters.end_date) {
      patientWhere.tanggal_daftar = {
        [Op.between]: [
          parseInt(filters.start_date),
          parseInt(filters.end_date),
        ],
      };
    } else if (filters.start_date) {
      patientWhere.tanggal_daftar = { [Op.gte]: parseInt(filters.start_date) };
    } else if (filters.end_date) {
      patientWhere.tanggal_daftar = { [Op.lte]: parseInt(filters.end_date) };
    }

    if (filters.name) {
      patientWhere.name = { [Op.iLike]: `%${filters.name}%` }; // PostgreSQL
      // kalau MySQL pakai Op.like
    }

    const { count, rows } = await AntrianModel.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      include: [
        {
          model: RawatJalanModel,
          as: "patient_data",
          required: true,
          where: patientWhere,
          attributes: [
            "patient_uuid",
            "no_rm",
            "status_rj",
            "name",
            "kode_booking",
            "no_antrian_admisi",
            "no_antrian_poli",
            "no_antrian_farmasi",
            "payment_method",
            "tanggal_daftar",
          ],
          include: [
            {
              model: JadwalDokterModel,
              as: "jadwal_dokter",
              required: false,
              attributes: [
                "practitioner_uuid",
                "lokasi_uuid",
                "day",
                "start_time",
                "end_time",
              ],
            },
            {
              model: PatientModel,
              as: "patient",
              required: false,
              attributes: ["identity", "no_identity"],
            },
          ],
        },
      ],
      attributes: antrianAttributes,
    });

    return {
      pagination: {
        totalData: count,
        totalPages: Math.ceil(count / limit),
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
      },
      data: rows.map(this.transform),
    };
  }

  static async findByUuid(uuid) {
    const antrian = await AntrianModel.findByPk(uuid, {
      include: [
        {
          model: RawatJalanModel,
          as: "patient_data",
          required: true,
          attributes: [
            "patient_uuid",
            "no_rm",
            "status_rj",
            "name",
            "kode_booking",
            "no_antrian_admisi",
            "no_antrian_poli",
            "no_antrian_farmasi",
            "payment_method",
          ],
          include: [
            {
              model: JadwalDokterModel,
              as: "jadwal_dokter",
              required: false,
              attributes: [
                "practitioner_uuid",
                "lokasi_uuid",
                "day",
                "start_time",
                "end_time",
              ],
            },
            {
              model: PatientModel,
              as: "patient",
              required: false,
              attributes: ["identity", "no_identity"],
            },
          ],
        },
      ],
      attributes: antrianAttributes,
    });

    if (!antrian) return null;

    return this.transform(antrian);
  }

  static async create(data) {
    const newAntrian = await AntrianModel.create(data);
    return await this.findByUuid(newAntrian.uuid);
  }

  static async update(uuid, data) {
    await AntrianModel.update(data, { where: { uuid } });
    return await this.findByUuid(uuid);
  }
}
