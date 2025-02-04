import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { DokterRepository } from "../repositories/dokter.repository.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { PoliklinikRepository } from "../repositories/poliklinik.repository.js";
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
    if (page_size === undefined) page_size = 10;

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

  static async findOneByDoctorAndLocation(faskes_uuid, params) {
    const { doctor_uuid: dokterUuid, location_uuid: poliUuid } =
      ZodValidator.validate(
        JadwalDokterSchema.DOCTOR_LOCATION_UUID_PARAM,
        params
      );

    const data = await JadwalDokterRepository.findOneByDoctorAndLocation(
      faskes_uuid,
      dokterUuid,
      poliUuid
    );

    if (!data) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return data;
  }

  static async create(faskes_uuid, body) {
    const validated = ZodValidator.validate(JadwalDokterSchema.CREATE, body);

    const dokter = await DokterRepository.findOneByUUID(
      faskes_uuid,
      validated.dokter_uuid
    );

    if (!dokter) {
      throw new BadRequestException(
        "Dokter dengan uuid tersebut tidak ditemukan."
      );
    }
    validated.code_antrian_dokter = dokter.code_antrian_dokter;

    const poli = await PoliklinikRepository.findOneByUUID(
      faskes_uuid,
      validated.poliklinik_uuid
    );

    if (!poli) {
      throw new BadRequestException(
        "Poli dengan uuid tersebut tidak ditemukan."
      );
    }
    validated.code_antrian_poli = poli.code_antrian_poli;

    const jadwal_dokter =
      await JadwalDokterRepository.findOneByDoctorAndLocation(
        faskes_uuid,
        validated.dokter_uuid,
        validated.poliklinik_uuid
      );

    if (jadwal_dokter) {
      throw new ConflictException(
        "Jadwal dokter untuk poliklinik tersebut sudah ada. Tolong Edit atau Hapus jadwal yang sudah ada."
      );
    }

    const data = await JadwalDokterRepository.create(faskes_uuid, validated);
    console.log(data);
    // Format the data
    const formattedData = {
      dokter: {
        uuid: data[0].practitionerUuid,
        code_antrian: data[0].codeAntrianDokter,
      },
      poliklinik: {
        uuid: data[0].lokasiUuid,
        code_antrian: data[0].codeAntrianPoli,
      },
      jadwal: data.map((datum) => {
        return {
          day: datum.day,
          start_time: datum.start_time,
          end_time: datum.end_time,
          durasi_pelayanan: datum.durasiPelayanan,
          kuota_jkn: datum.kuotaJkn,
          kuota_non_jkn: datum.kuotaNonJkn,
          aktif: datum.status,
          kuota: datum.kuota,
        };
      }),
    };

    return formattedData;
  }

  static async updateByDoctorAndLocation(faskes_uuid, params, body) {
    const { doctor_uuid: dokterUuid, location_uuid: poliUuid } =
      ZodValidator.validate(
        JadwalDokterSchema.DOCTOR_LOCATION_UUID_PARAM,
        params
      );

    const validated = ZodValidator.validate(JadwalDokterSchema.UPDATE, body);
    validated.dokterUuid = dokterUuid;
    validated.poliUuid = poliUuid;

    const dokter = await DokterRepository.findOneByUUID(
      faskes_uuid,
      dokterUuid
    );

    if (!dokter) {
      throw new BadRequestException(
        "Dokter dengan uuid tersebut tidak ditemukan."
      );
    }
    validated.code_antrian_dokter = dokter.code_antrian_dokter;

    const poli = await PoliklinikRepository.findOneByUUID(
      faskes_uuid,
      poliUuid
    );

    if (!poli) {
      throw new BadRequestException(
        "Poli dengan uuid tersebut tidak ditemukan."
      );
    }
    validated.code_antrian_poli = poli.code_antrian_poli;

    const jadwal_dokter =
      await JadwalDokterRepository.findOneByDoctorAndLocation(
        faskes_uuid,
        dokterUuid,
        poliUuid
      );

    if (!jadwal_dokter) {
      throw new NotFoundException(
        "Jadwal dokter untuk poliklinik tersebut tidak ditemukan, silakan create terlebih dahulu."
      );
    }

    const data = await JadwalDokterRepository.updateByDoctorAndLocation(
      faskes_uuid,
      dokterUuid,
      poliUuid,
      validated
    );

    // Format the data
    const formattedData = {
      dokter: {
        uuid: data[0].practitionerUuid,
        code_antrian: data[0].codeAntrianDokter,
      },
      poliklinik: {
        uuid: data[0].lokasiUuid,
        code_antrian: data[0].codeAntrianPoli,
      },
      jadwal: data.map((datum) => {
        return {
          day: datum.day,
          start_time: datum.start_time,
          end_time: datum.end_time,
          durasi_pelayanan: datum.durasiPelayanan,
          kuota_jkn: datum.kuotaJkn,
          kuota_non_jkn: datum.kuotaNonJkn,
        };
      }),
    };
  }
}
