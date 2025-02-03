import { NotFoundException } from "../exceptions/not-found.exception.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { JadwalDokterSchema } from "../validations/jadwal-dokter.validation.js";
import ZodValidator from "../validations/zod.validation.js";

export class JadwalDokterService {
  static async findAll(faskes_uuid, filterQuery) {
    const queries = ZodValidator.validate(
      JadwalDokterSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size, ...filters } = queries;
    if (page === undefined) page = 1;
    if (page_size === undefined) page_size = 2;

    const { pagination, data } = await JadwalDokterRepository.findAll(
      faskes_uuid,
      filters,
      page,
      page_size
    );

    if (data.length === 0) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return { pagination, data };
  }
}
