import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { AdmissionRJRepository } from "../repositories/admission-rj.repository.js";
import { DokterRepository } from "../repositories/dokter.repository.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { PoliklinikRepository } from "../repositories/poliklinik.repository.js";
import { JadwalDokterSchema } from "../validations/jadwal-dokter.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { FormatterService } from "./formatter.service.js";
import { TransactionService } from "./transaction.service.js";
import { AppointmentClient } from "../clients/appointment.client.js";
import { TimeConverter } from "../helpers/time-converter.helper.js";
import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";
import moment from "moment";
import { ToIndoDay } from "../helpers/to-indo-day.js";

export class JadwalDokterService {
  //FOR MOBILE START
  static async getAvailableKuota({
    faskesUuid,
    dokterUuid,
    poliUuid,
    tanggalPelayanan,
  }) {
    // Validasi input tanggal
    if (!tanggalPelayanan) {
      throw new BadRequestException("Tanggal pelayanan wajib diisi.");
    }

    const tanggal = moment(tanggalPelayanan);
    const hariDalamInggris = tanggal.format("dddd");
    const hariDalamIndonesia = ToIndoDay.fromEng(hariDalamInggris);

    // 1. Dapatkan semua jadwal dasar untuk hari tersebut
    const jadwalDasarList = await JadwalDokterRepository.findAllSchedulesByDay({
      faskesUuid,
      dokterUuid,
      poliUuid,
      day: hariDalamIndonesia,
    });

    if (!jadwalDasarList || jadwalDasarList.length === 0) {
      return []; // Kembalikan array kosong jika tidak ada jadwal sama sekali
    }

    // 2. Untuk setiap jadwal, cari laporannya dan hitung sisa kuota
    const jadwalDenganKuota = await Promise.all(
      jadwalDasarList.map(async (jadwalDasar) => {
        const report = await ReportAntrianRepository.findOrCreateReport({
          jadwalDokter: jadwalDasar,
          tanggalPelayanan: tanggal.format("YYYY-MM-DD"),
        });

        return {
          jadwal_dokter_uuid: jadwalDasar.uuid,
          start_time: jadwalDasar.startTime,
          end_time: jadwalDasar.endTime,
          sisa_kuota: report.kuotaSisa,
        };
      })
    );

    return jadwalDenganKuota;
  }


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

  //FOR MOBILE END

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

      //verifikasi dokter
      const [dokter, poli] = await Promise.all([
        DokterRepository.findOneByUUID({
          faskesUuid,
          dokterUuid: validated.dokter_uuid,
          transaction: tx,
        }),
        PoliklinikRepository.findOneByUUID({
          faskesUuid,
          poliklinikUuid: validated.poliklinik_uuid,
          transaction: tx,
        }),
      ]);

      if (!dokter) {
        throw new BadRequestException(
          "Dokter dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_dokter = dokter.code_antrian_dokter;

      if (!poli) {
        throw new BadRequestException(
          "Poli dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_poli = poli.code_antrian_poli;

      //verifikasi apakah jadwal dokter sudah ada
      const existingJadwalSet =
        await JadwalDokterRepository.findAllByDoctorAndLocation({
          faskesUuid,
          dokterUuid: validated.dokter_uuid,
          poliUuid: validated.poliklinik_uuid,
          transaction: tx,
        });

      const newJadwalList = validated.jadwal;

      if (existingJadwalSet) {
        for (const newJadwal of newJadwalList) {
          for (const existingJadwal of existingJadwalSet.jadwal_dokter) {
            if (newJadwal.day === existingJadwal.day) {
              const newStartTime = TimeConverter.toMinutes(
                newJadwal.start_time
              );
              const newEndTime = TimeConverter.toMinutes(newJadwal.end_time);
              const existingStartTime = TimeConverter.toMinutes(
                existingJadwal.start_time
              );
              const existingEndTime = TimeConverter.toMinutes(
                existingJadwal.end_time
              );

              if (
                newStartTime < existingEndTime &&
                existingStartTime < newEndTime
              ) {
                throw new ConflictException(
                  `Jadwal untuk hari ${newJadwal.day} berbenturan.`
                );
              }
            }
          }
        }
      }

      validated.jadwal.forEach((jadwal) => {
        jadwal.kuota = jadwal.kuota_jkn + jadwal.kuota_non_jkn;

        if (jadwal.kuota > 0) {
          const totalMenit =
            TimeConverter.toMinutes(jadwal.end_time) -
            TimeConverter.toMinutes(jadwal.start_time);
          jadwal.durasi_pelayanan = Math.floor(totalMenit / jadwal.kuota);
        } else {
          jadwal.durasi_pelayanan = 0;
        }
      });

      //create jadwal dokter
      const data = await JadwalDokterRepository.create({
        faskesUuid,
        jadwalDokter: validated,
        transaction: tx,
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

      const [dokter, poli, jadwalDokter] = await Promise.all([
        DokterRepository.findOneByUUID({
          faskesUuid,
          dokterUuid,
          transaction: tx,
        }),
        PoliklinikRepository.findOneByUUID({
          faskesUuid,
          poliklinikUuid: poliUuid,
          transaction: tx,
        }),
        JadwalDokterRepository.findAllByDoctorAndLocation({
          faskesUuid,
          dokterUuid,
          poliUuid,
          transaction: tx,
        }),
      ]);

      // If it is not exis, then throw the request is bad.
      if (!dokter) {
        throw new BadRequestException(
          "Dokter dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_dokter = dokter.code_antrian_dokter;

      // If it is not exist, then throw the request is bad.
      if (!poli) {
        throw new BadRequestException(
          "Poli dengan uuid tersebut tidak ditemukan."
        );
      }
      validated.code_antrian_poli = poli.code_antrian_poli;

      if (!jadwalDokter) {
        throw new NotFoundException(
          "Jadwal dokter untuk poliklinik tersebut tidak ditemukan, silakan create terlebih dahulu."
        );
      }

      const existingSchedules = jadwalDokter.jadwal_dokter;
      const uuidsToDelete = validated.deleted || [];

      // Hitung jumlah jadwal yang akan tersisa setelah dihapus
      const remainingSchedulesCount =
        existingSchedules.length - uuidsToDelete.length;

      // Jika user mencoba menghapus semua jadwal yang tersisa, tolak permintaan.
      if (existingSchedules.length > 0 && remainingSchedulesCount === 0) {
        throw new BadRequestException(
          "Tidak bisa menghapus jadwal terakhir. Gunakan endpoint DELETE untuk menghapus seluruh set jadwal dokter di poliklinik ini."
        );
      }

      const jadwalDokterUuids = jadwalDokter.jadwal_dokter.map(
        (j) => j.jadwal_dokter_uuid
      );

      const bookedSchedulesCount =
        await ReportAntrianRepository.countBookedSchedules({
          jadwalDokterUuids,
          transaction: tx,
        });

      if (bookedSchedulesCount > 0) {
        throw new ConflictException(
          "Jadwal tidak dapat diubah karena sudah ada pasien yang terdaftar."
        );
      }

      if (validated.added && validated.added.length > 0) {
        const allCurrentSchedules = [
          ...existingSchedules,
          ...(validated.updated || []),
        ];

        for (const newJadwal of validated.added) {
          for (const currentJadwal of allCurrentSchedules) {
            // Jika harinya sama, periksa tumpang tindih waktu
            if (newJadwal.day === currentJadwal.day) {
              const newStartTime = TimeConverter.toMinutes(
                newJadwal.start_time
              );
              const newEndTime = TimeConverter.toMinutes(newJadwal.end_time);
              const currentStartTime = TimeConverter.toMinutes(
                currentJadwal.start_time
              );
              const currentEndTime = TimeConverter.toMinutes(
                currentJadwal.end_time
              );

              if (
                newStartTime < currentEndTime &&
                currentStartTime < newEndTime
              ) {
                throw new ConflictException(
                  `Jadwal baru untuk hari ${newJadwal.day} berbenturan dengan jadwal yang sudah ada.`
                );
              }
            }
          }
        }
      }

      if (validated.updated && validated.updated.length > 0) {
        validated.updated.forEach((jadwalToUpdate) => {
          const oldJadwal = jadwalDokter.jadwal_dokter.find(
            (j) => j.jadwal_dokter_uuid === jadwalToUpdate.jadwal_dokter_uuid
          );
          if (oldJadwal) {
            const oldKuotaJkn = parseInt(oldJadwal.kuota_jkn, 10);
            const oldKuotaNonJkn = parseInt(oldJadwal.kuota_non_jkn, 10);

            const newKuotaJkn =
              jadwalToUpdate.kuota_jkn !== undefined
                ? parseInt(jadwalToUpdate.kuota_jkn, 10)
                : oldKuotaJkn;

            const newKuotaNonJkn =
              jadwalToUpdate.kuota_non_jkn !== undefined
                ? parseInt(jadwalToUpdate.kuota_non_jkn, 10)
                : oldKuotaNonJkn;

            jadwalToUpdate.kuota = newKuotaJkn + newKuotaNonJkn;

            if (jadwalToUpdate.kuota > 0) {
              const startTime =
                jadwalToUpdate.start_time || oldJadwal.start_time;
              const endTime = jadwalToUpdate.end_time || oldJadwal.end_time;

              const totalMenit =
                TimeConverter.toMinutes(endTime) -
                TimeConverter.toMinutes(startTime);
              jadwalToUpdate.durasi_pelayanan = Math.floor(
                totalMenit / jadwalToUpdate.kuota
              );
            } else {
              jadwalToUpdate.durasi_pelayanan = 0;
            }
          }
        });
      }

      //durasi otomatis pada update
      if (validated.added && validated.added.length > 0) {
        validated.added.forEach((jadwal) => {
          jadwal.kuota = jadwal.kuota_jkn + jadwal.kuota_non_jkn;

          if (jadwal.kuota > 0) {
            const totalMenit =
              TimeConverter.toMinutes(jadwal.end_time) -
              TimeConverter.toMinutes(jadwal.start_time);
            jadwal.durasi_pelayanan = Math.floor(totalMenit / jadwal.kuota);
          } else {
            jadwal.durasi_pelayanan = 0;
          }
        });
      }

      const camelCasedBody = FormatterService.toCamelCase(validated);
      validated.dokterUuid = dokterUuid;
      validated.poliUuid = poliUuid;

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
        await JadwalDokterRepository.bulkUpdate({
          faskesUuid,
          jadwalDokterToBeUpdated: expectedPayload,
          transaction: tx,
        });
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
        await JadwalDokterRepository.bulkCreate({
          faskesUuid,
          jadwalDokterToBeCreated: expectedPayload,
          transaction: tx,
        });
      }
    });
  }

  static async deleteAllByDoctorAndLocation({ faskesUuid, params }) {
    await TransactionService.run(async (tx) => {
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

      const jadwalDokterUuids = jadwalDokter.jadwal_dokter.map(
        (j) => j.jadwal_dokter_uuid
      );

      const bookedSchedulesCount =
        await ReportAntrianRepository.countBookedSchedules({
          jadwalDokterUuids,
          transaction: tx,
        });

      if (bookedSchedulesCount > 0) {
        throw new ConflictException(
          "Jadwal tidak dapat dihapus karena sudah ada pasien yang terdaftar."
        );
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
