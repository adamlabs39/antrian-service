import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";
import AntrianModel from "../models/antrian.model.js";
import { FormatterService } from "../services/formatter.service.js";
import { PatientModel } from "@adameds/model-sdk/admisi";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";

const antrianAttributes = [
  "uuid",
  "rawat_jalan_uuid",
  "status_panggilan",
  "pelayanan",
  "jenis_pasien",
  "pasien_baru",
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

  static async findAll(faskesUuid) {
    const antrianList = await AntrianModel.findAll({
      where: { faskes_uuid: faskesUuid },
      include: [
        {
          model: RawatJalanModel,
          as: "patient_data",
          required: false,
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

    return antrianList.map(this.transform);
  }

  static async findByUuid(uuid) {
    const antrian = await AntrianModel.findByPk(uuid, {
      include: [
        {
          model: RawatJalanModel,
          as: "patient_data",
          required: false,
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
