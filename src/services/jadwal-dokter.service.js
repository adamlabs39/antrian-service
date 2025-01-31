import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { CommonSchema } from "../validations/common-schema.validation.js";
import { JadwalDokterSchema } from "../validations/jadwal-dokter.validation.js";
import ZodValidator from "../validations/zod.validation.js";

export class JadwalDokterService {
  static async findAll(faskes_uuid, filterQuery) {
    ZodValidator.validate(JadwalDokterSchema.FILTER_QUERY, filterQuery);
    return JadwalDokterRepository.findAll(faskes_uuid, filterQuery);
  }
}
