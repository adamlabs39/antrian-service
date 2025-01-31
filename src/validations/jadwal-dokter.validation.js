import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";

export class JadwalDokterSchema {
  /**
   * e.g.
   *
   * dokter: zahro
   * poli: poli gigi
   * start_date:  01-01-2024
   * end_date: 02-03-2024
   * status: aktif
   */
  static FILTER_QUERY = z
    .object({
      dokter: z.string().optional(),
      poli: z.string().optional(),
      start_date: CommonSchema.STRING_DATE.optional(),
      end_date: CommonSchema.STRING_DATE.optional(),
      status: CommonSchema.ACTIVE_ENUM.optional(),
    })
    .strict();

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
        .max(7),
      start_time: CommonSchema.TIME,
      end_time: CommonSchema.TIME,
      durasi_pelayanan: z.number().int().positive(),
      kuota_jkn: z.number().int().positive(),
      kuota_non_jkn: z.number().int().positive(),
    })
    .strict();
}
