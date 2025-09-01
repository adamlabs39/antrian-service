import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import AdmisiAntrianRepository from "../repositories/admisi-antrian.repository.js";
import { FormatterService } from "./formatter.service.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

export default class AdmisiAntrianService {
  static async getAllAntrian({faskesUuid, filterBy: filterQuery}) {

      let { page, page_size: pageSize, ...filters } = filterQuery;
      if (page === undefined) page = 1;
      if (pageSize === undefined) pageSize = 10;

     const { pagination, data } = await AdmisiAntrianRepository.findAll({
       faskesUuid,
       filters,
       page,
       pageSize,
     });
    
        if (data.length === 0) {
          throw new NotFoundException("Data tidak ditemukan");
        }
    
        return { pagination, data };
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
