import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";
import { TimeConverter } from "../helpers/time-converter.helper.js";

const JADWAL_DETAIL_BASE = z
  .object({
    day: z
      .number({
        required_error: "Hari wajib diisi.",
        invalid_type_error: "Hari harus berupa angka.",
      })
      .int()
      .min(1, { message: "Angka hari minimal adalah 1 (Senin)." })
      .max(7, { message: "Angka hari maksimal adalah 7 (Minggu)." })
      .transform((val) => {
        const days = [
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu",
        ];
        return days[val - 1];
      }),
    start_time: CommonSchema.TIME,
    end_time: CommonSchema.TIME,
    // durasi_pelayanan: z.number().int().positive(),
    kuota_jkn: z
      .number({
        required_error: "Kuota JKN wajib diisi.",
        invalid_type_error: "Kuota JKN harus berupa angka.",
      })
      .int()
      .nonnegative({
        message: "Kuota JKN harus lebih dari 0",
      }),
    kuota_non_jkn: z
      .number({
        required_error: "Kuota Non-JKN wajib diisi.",
        invalid_type_error: "Kuota Non-JKN harus berupa angka.",
      })
      .int()
      .nonnegative({
        message: "Kuota Non-JKN harus lebih dari 0",
      }),
    aktif: z.boolean(),
  })
  .strict();

export class JadwalDokterSchema {
  /**
   * e.g.
   *
   * dokter: zahro
   * poli: poli gigi
   * aktif: true
   */
  static FILTER_QUERY = z.object({
    dokter: z
      .string()
      .trim()
      .min(1, {
        message: "Nama dokter tidak boleh kosong",
      })
      .max(255, {
        message: "Nama dokter tidak bisa terlalu panjang!",
      })
      .optional(),
    poli: z
      .string()
      .trim()
      .min(1, {
        message: "Nama poliklinik tidak boleh kosong",
      })
      .max(255, {
        message: "Nama poliklinik tidak bisa terlalu panjang!",
      })
      .optional(),
    aktif: CommonSchema.TRUE_FALSE_UNDEFINED_STRING.optional(),
    page: CommonSchema.STRING_TO_NUMBER.optional(),
    page_size: CommonSchema.STRING_TO_NUMBER.optional(),
  });

  static DOCTOR_LOCATION_UUID_PARAM = z.object({
    doctor_uuid: CommonSchema.UUID_PARAM,
    location_uuid: CommonSchema.UUID_PARAM,
  });

  static JADWAL_DETAIL = JADWAL_DETAIL_BASE.refine(
    (data) => {
      return (
        TimeConverter.toMinutes(data.start_time) <
        TimeConverter.toMinutes(data.end_time)
      );
    },
    {
      message: "Jam mulai harus lebih awal dari jam selesai.",
      path: ["end_time"],
    }
  );
}

JadwalDokterSchema.CREATE = z
  .object({
    poliklinik_uuid: z.string().uuid({
      message: "poliklinik_uuid harus berupa UUID.",
    }),
    dokter_uuid: z.string().uuid({
      message: "dokter_uuid harus berupa UUID.",
    }),
    jadwal: z.array(JadwalDokterSchema.JADWAL_DETAIL).min(1, {
      message: "Jadwal tidak boleh kosong",
    }),
  })
  .strict();

JadwalDokterSchema.UPDATE = z.object({
  added: z.array(JadwalDokterSchema.JADWAL_DETAIL).optional(),
  deleted: z.array(z.string().uuid()).optional(),
  updated: z
    .array(
      JADWAL_DETAIL_BASE.partial().extend({
        jadwal_dokter_uuid: z.string().uuid(),
      })
    )
    .optional(),
});
