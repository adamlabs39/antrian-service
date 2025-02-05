import { NotFoundException } from "../exceptions/not-found.exception.js";
import { LayarAntrianRepository } from "../repositories/layar-antrian.repository.js";
import { LayarAntrianSchema } from "../validations/layar-antrian.validation.js";
import ZodValidator from "../validations/zod.validation.js";

export class LayarAntrianService {
  static async findAll({ faskesUuid, filterBy: filterQuery }) {
    const queries = ZodValidator.validate(
      LayarAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = queries;
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;

    const { pagination, data } = await LayarAntrianRepository.findAll({
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

  static async findOne({ faskesUuid, params }) {
    const { uuid } = ZodValidator.validate(
      LayarAntrianSchema.UUID_PARAM,
      params
    );

    const data = await LayarAntrianRepository.findOne({
      faskesUuid,
      uuid,
    });

    if (!data) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return data;
  }
}
