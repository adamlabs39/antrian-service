import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { DokterRepository } from "../repositories/dokter.repository.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { PoliklinikRepository } from "../repositories/poliklinik.repository.js";
import { JadwalDokterSchema } from "../validations/jadwal-dokter.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { FormatterService } from "./formatter.service.js";
import { TransactionService } from "./transaction.service.js";

export class JadwalDokterService {
  static async findAll({ faskesUuid, filterBy: filterQuery }) {
    const queries = ZodValidator.validate(
      JadwalDokterSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = queries;
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;

    const { pagination, data } = await JadwalDokterRepository.findAll({
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

  static async findAllByDoctorAndLocation({ faskesUuid, params }) {
    const { doctor_uuid: dokterUuid, location_uuid: poliUuid } =
      ZodValidator.validate(
        JadwalDokterSchema.DOCTOR_LOCATION_UUID_PARAM,
        params
      );

    const data = await JadwalDokterRepository.findAllByDoctorAndLocation({
      faskesUuid,
      dokterUuid,
      poliUuid,
    });

    if (!data) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return data;
  }

  static async create({ faskesUuid, jadwalDokter }) {
    return TransactionService.run(async (tx) => {
      const validated = ZodValidator.validate(
        JadwalDokterSchema.CREATE,
        jadwalDokter
      );

      const dokter = await DokterRepository.findOneByUUID({
        faskesUuid,
        dokterUuid: validated.dokter_uuid,
      });

      if (!dokter) {
        throw new BadRequestException(
          "Dokter dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_dokter = dokter.code_antrian_dokter;

      const poli = await PoliklinikRepository.findOneByUUID({
        faskesUuid,
        poliklinikUuid: validated.poliklinik_uuid,
      });

      if (!poli) {
        throw new BadRequestException(
          "Poli dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_poli = poli.code_antrian_poli;

      const jadwal_dokter =
        await JadwalDokterRepository.findAllByDoctorAndLocation({
          faskesUuid,
          dokterUuid: validated.dokter_uuid,
          poliUuid: validated.poliklinik_uuid,
        });

      if (jadwal_dokter) {
        throw new ConflictException(
          "Jadwal dokter untuk poliklinik tersebut sudah ada. Tolong Edit atau Hapus jadwal yang sudah ada."
        );
      }

      const data = await JadwalDokterRepository.create({
        faskesUuid,
        jadwalDokter: validated,
      });

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
    });
  }

  static async updateByDoctorAndLocation({ faskesUuid, params, body }) {
    return await TransactionService.run(async (tx) => {
      // Validate the UUIDs
      const { doctor_uuid: dokterUuid, location_uuid: poliUuid } =
        ZodValidator.validate(
          JadwalDokterSchema.DOCTOR_LOCATION_UUID_PARAM,
          params
        );

      // Validate the body
      const validated = ZodValidator.validate(JadwalDokterSchema.UPDATE, body);
      validated.dokterUuid = dokterUuid;
      validated.poliUuid = poliUuid;

      // Get the dokter
      const dokter = await DokterRepository.findOneByUUID({
        faskesUuid,
        dokterUuid,
        transaction: tx,
      });

      // If it is not exis, then throw the request is bad.
      if (!dokter) {
        throw new BadRequestException(
          "Dokter dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_dokter = dokter.code_antrian_dokter;

      // Get the poli
      const poli = await PoliklinikRepository.findOneByUUID({
        faskesUuid,
        poliklinikUuid: poliUuid,
        transaction: tx,
      });

      // If it is not exist, then throw the request is bad.
      if (!poli) {
        throw new BadRequestException(
          "Poli dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_poli = poli.code_antrian_poli;

      const jadwalDokter =
        await JadwalDokterRepository.findAllByDoctorAndLocation({
          faskesUuid,
          dokterUuid,
          poliUuid,
        });

      // If the jadwal dokter itu bahkan ga ada.
      // Throw not found.
      if (!jadwalDokter) {
        throw new NotFoundException(
          "Jadwal dokter untuk poliklinik tersebut tidak ditemukan, silakan create terlebih dahulu."
        );
      }

      /**
       * @TODO : Do there exist booking? If yes, then we cannot update schedule that has delete
       */

      const booked = false;
      if (booked && validated.added) {
        throw new ConflictException(
          "Gagal mengupdate jadwal karena terdapat book yang sudah dilakukan pada jadwal tersebut. Tetapi masih dapat melakukan nonaktif."
        );
      }

      const camelCasedBody = FormatterService.toCamelCase(validated);

      // Bulk delete
      if (validated.deleted.length > 0) {
        await JadwalDokterRepository.bulkDelete({
          faskesUuid,
          UUIDsToBeDeleted: camelCasedBody.deleted,
          transaction: tx,
        });
      }

      // Bulk update
      if (validated.updated.length > 0) {
        const expectedPayload = FormatterService.extendObjects(
          {
            dokterUuid: camelCasedBody.dokterUuid,
            poliklinikUuid: camelCasedBody.poliUuid,
          },
          camelCasedBody.updated
        );
        const ret = await JadwalDokterRepository.bulkUpdate({
          faskesUuid,
          jadwalDokterToBeUpdated: expectedPayload,
          transaction: tx,
        });
        console.log(ret);
      }

      // Bulk create
      if (validated.added.length > 0) {
        const expectedPayload = FormatterService.extendObjects(
          {
            dokterUuid: camelCasedBody.dokterUuid,
            poliklinikUuid: camelCasedBody.poliUuid,
            codeAntrianDokter: camelCasedBody.codeAntrianDokter,
            codeAntrianPoli: camelCasedBody.codeAntrianPoli,
          },
          camelCasedBody.added
        );
        const ret = await JadwalDokterRepository.bulkCreate({
          faskesUuid,
          jadwalDokterToBeCreated: expectedPayload,
          transaction: tx,
        });

        console.log(ret);
      }
    });
  }

  static async deleteAllByDoctorAndLocation({ faskesUuid, params }) {
    await TransactionService.run(async (tx) => {
      /**
       * @TODO : Do there exist booking? If yes, then we cannot delete the schedule
       */

      const { doctor_uuid: dokterUuid, location_uuid: poliUuid } =
        ZodValidator.validate(
          JadwalDokterSchema.DOCTOR_LOCATION_UUID_PARAM,
          params
        );

      const jadwalDokter =
        await JadwalDokterRepository.findAllByDoctorAndLocation({
          faskesUuid,
          dokterUuid,
          poliUuid,
          transaction: tx,
        });

      if (!jadwalDokter) {
        throw new NotFoundException("Data tidak ditemukan");
      }

      await JadwalDokterRepository.deleteAllByDoctorAndLocation({
        faskesUuid,
        dokterUuid,
        poliUuid,
        transaction: tx,
      });
    });
  }
}
