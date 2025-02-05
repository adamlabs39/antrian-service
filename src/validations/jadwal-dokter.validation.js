import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";

export class JadwalDokterSchema {
  /**
   * e.g.
   *
   * dokter: zahro
   * poli: poli gigi
   * aktif: true
   */
  static FILTER_QUERY = z.object({
    dokter: z.string().optional(),
    poli: z.string().optional(),
    aktif: CommonSchema.TRUE_FALSE_UNDEFINED_STRING.optional(),
    page: CommonSchema.STRING_TO_NUMBER.optional(),
    page_size: CommonSchema.STRING_TO_NUMBER.optional(),
  });

  static DOCTOR_LOCATION_UUID_PARAM = z.object({
    doctor_uuid: CommonSchema.UUID_PARAM,
    location_uuid: CommonSchema.UUID_PARAM,
  });

  /**
   * e.g.
   * {
            "day" : 1,
            "start_time" : "09.00",
            "end_time" : "12.000",
            "durasi_pelayanan" : "20 menit",
            "kuota_jkn" : 5,
            "kuota_non_jkn" : 5
        },
    */
  static JADWAL_DETAIL = z
    .object({
      day: z
        .number({
          message:
            "Invalid day value. Must be a number. (1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu, 7: Minggu)",
        })
        .int()
        .min(1)
        .max(7)
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
      durasi_pelayanan: z.number().int().positive(),
      kuota_jkn: z.number().int().positive(),
      kuota_non_jkn: z.number().int().positive(),
      aktif: z.boolean(),
    })
    .strict();

  static CREATE = z
    .object({
      poliklinik_uuid: z.string().uuid(),
      dokter_uuid: z.string().uuid(),
      jadwal: z.array(JadwalDokterSchema.JADWAL_DETAIL),
    })
    .strict();

  static UPDATE = z.object({
    added: z.array(JadwalDokterSchema.JADWAL_DETAIL).optional(),
    deleted: z.array(z.string().uuid()).optional(),
    updated: z
      .array(
        JadwalDokterSchema.JADWAL_DETAIL.partial().extend({
          jadwal_dokter_uuid: z.string().uuid(),
        })
      )
      .optional(),
  });
}
