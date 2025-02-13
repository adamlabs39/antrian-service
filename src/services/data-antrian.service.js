import { NotFoundException } from "../exceptions/not-found.exception.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { DataAntrianSchema } from "../validations/data-antrian.validation.js";
import ZodValidator from "../validations/zod.validation.js";

export class DataAntrianService {
  static async findAll({ faskesUuid, filterQuery }) {
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

  static async findAllAdmisi({ faskesUuid, filterQuery }) {
    const validatedFilter = ZodValidator.validate(
      DataAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    const { pagination, data } = await AntrianRepository.findAllAdmisi({
      faskesUuid,
      filterQuery: validatedFilter,
    });

    if (!data || data.length === 0) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return { pagination, data };
  }
}
