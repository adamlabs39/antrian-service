import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import AdmisiAntrianRepository from "../repositories/admisi-antrian.repository.js";
import { FormatterService } from "./formatter.service.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

export default class AdmisiAntrianService {
  static async getAllAntrian({ faskesUuid, filterBy: filterQuery }) {
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

  static async getAllNoPagination({ faskesUuid, filterBy = {} }) {
    return await AdmisiAntrianRepository.findAll({
      faskesUuid,
      filters: filterBy,
      noPagination: true,
    });
  }

  static async getAntrianByUuid(faskesUuid, uuid) {
    const antrian = await AdmisiAntrianRepository.findByUuid(uuid);
    if (!antrian) {
      throw new Error("Antrian tidak ditemukan");
    }
    return antrian;
  }

  static async createAntrian({ faskesUuid, requestData, transaction }) {
    const camelCaseBody = FormatterService.toCamelCase(requestData);

    const newAntrian = await AdmisiAntrianRepository.create(
      {
        statusPanggilan: 0,
        faskesUuid,
        ...camelCaseBody,
      },
      { transaction }
    );

    return newAntrian;
  }

  static async updateAntrian({ faskesUuid, uuid, requestData, transaction }) {
    const { statusPanggilan } = FormatterService.toCamelCase(requestData);
    const antrian = await AdmisiAntrianRepository.findByUuid(uuid, {
      transaction,
    });
    if (!antrian) {
      throw new Error("Antrian tidak ditemukan");
    }

    await AdmisiAntrianRepository.update(
      uuid,
      {
        statusPanggilan,
        updatedAt: moment().unix(),
      },
      { transaction }
    );

    return await AdmisiAntrianRepository.findByUuid(uuid, { transaction });
  }

  //FOR MOBILE

  static async createAntrianMobile({ faskesUuid, requestData, transaction }) {
    const camelCaseBody = FormatterService.toCamelCase(requestData);

    const dataToCreate = {
      statusPanggilan: 0,
      faskesUuid,
      ...camelCaseBody,
    };

    const antrianMobile = await AdmisiAntrianRepository.create(dataToCreate, { transaction });

    return antrianMobile;
  }
}
