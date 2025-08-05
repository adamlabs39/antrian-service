import { NotFoundException } from "../exceptions/not-found.exception.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { DataAntrianSchema } from "../validations/data-antrian.validation.js";
import ZodValidator from "../validations/zod.validation.js";

export class DataAntrianService {
  static async findAll({ faskesUuid, filters: filterQuery }) {
    const validatedFilter = ZodValidator.validate(
      DataAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    const { pagination, data } = await AntrianRepository.findAll({
      faskesUuid,
      filterQuery: validatedFilter,
    });

    if (data.length === 0) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return { pagination, data };
  }

  static async findAllAdmisi({ faskesUuid, filters: filterQuery }) {
    const validatedFilter = ZodValidator.validate(
      DataAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = validatedFilter;
    page = page || 1;
    pageSize = pageSize || 10;

    const { pagination, data } = await AntrianRepository.findAll({
      faskesUuid,
      filterQuery: filters,
      pageSize,
      tipe: "admisi",
    });
    if (data.length === 0) {
      throw new NotFoundException("Data antrian admisi tidak ditemukan");
    }
    return { pagination, data };
  }

  static async findAllPoli({ faskesUuid, filters: filterQuery }) {
    const queries = ZodValidator.validate(
      DataAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = queries;
    page = page || 1;
    pageSize = pageSize || 10;

    const { pagination, data } = await AntrianRepository.findAll({
      // Diubah ke AntrianRepository
      faskesUuid,
      filters,
      page,
      pageSize,
      tipe: "poli",
    });

    if (data.length === 0) {
      throw new NotFoundException("Data antrian poliklinik tidak ditemukan");
    }

    return { pagination, data };
  }

  static async findAllFarmasi({ faskesUuid, filters: filterQuery }) {
    const queries = ZodValidator.validate(
      DataAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = queries;
    page = page || 1;
    pageSize = pageSize || 10;

    const { pagination, data } = await AntrianRepository.findAll({
      // Diubah ke AntrianRepository
      faskesUuid,
      filters,
      page,
      pageSize,
      tipe: "farmasi",
    });

    if (data.length === 0) {
      throw new NotFoundException("Data antrian farmasi tidak ditemukan");
    }

    return { pagination, data };
  }
}
