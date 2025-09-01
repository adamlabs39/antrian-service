import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import AdmisiAntrianRepository from "../repositories/admisi-antrian.repository.js";
import { FormatterService } from "./formatter.service.js";

export default class AdmisiAntrianService {
  static async getAllAntrian(faskesUuid, filters) {
    return await AdmisiAntrianRepository.findAll(faskesUuid, filters);
  }

  static async getAntrianByUuid(faskesUuid, uuid) {
    const antrian = await AdmisiAntrianRepository.findByUuid(uuid);
    if (!antrian) {
      throw new Error("Antrian tidak ditemukan");
    }
    return antrian;
  }

  static async createAntrian({ faskesUuid, requestData }) {
    const camelCaseBody = FormatterService.toCamelCase(requestData);

    const newAntrian = await AdmisiAntrianRepository.create({
      statusPanggilan: 0,
      faskesUuid,
      ...camelCaseBody,
    });

    return newAntrian;
  }

  static async updateAntrian({ faskesUuid, uuid, requestData }) {
    const { statusPanggilan } = FormatterService.toCamelCase(requestData);

    // if (!statusPanggilan || statusPanggilan === 0 || statusPanggilan > 6) {
    //   throw new Error(
    //     "statusPanggilan wajib diisi dengan nilai antara 1 sampai 6"
    //   );
    // }

    const antrian = await AdmisiAntrianRepository.findByUuid(uuid);
    if (!antrian) {
      throw new Error("Antrian tidak ditemukan");
    }

    // if (antrian.faskesUuid !== faskesUuid) {
    //   throw new Error("Tidak punya akses untuk mengubah antrian ini");
    // }

    const updated = await AdmisiAntrianRepository.update(uuid, {
      statusPanggilan,
      updatedAt: moment().unix(),
    });

    return updated;
  }
}
