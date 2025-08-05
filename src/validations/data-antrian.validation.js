import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";

export class DataAntrianSchema {
  static FILTER_QUERY = z.object({
    page: z.coerce.number().int().positive().optional(),
    page_size: z.coerce.number().int().positive().optional(),

    nama: z
      .string()
      .trim()
      .min(1, { message: "Nama minimal 1 karakter." })
      .max(255, {
        message: "Nama maksimal tidak bisa terlalu panjang.",
      })
      .optional(),
    batas_tanggal_awal: CommonSchema.STRING_DATE.optional(),
    batas_tanggal_akhir: CommonSchema.STRING_DATE.optional(),
    status: z
      .enum(["antri", "proses", "lewati", "selesai"], {
        message: "Invalid status value.",
      })
      .optional(),
  });

  static CREATE = z
    .object({
      tipeAntrian: z.enum(["admisi", "poli", "farmasi"], {
        required_error: "Tipe antrian wajib diisi.",
      }),
      lokasiUuid: CommonSchema.UUID_PARAM.optional(), // Wajib ada jika tipeAntrian = 'poli'
      pasienUuid: CommonSchema.UUID_PARAM,
      admissionUuid: CommonSchema.UUID_PARAM,
    })
    .refine(
      (data) => {
        if (data.tipeAntrian === "poli" && !data.lokasiUuid) {
          return false;
        }
        return true;
      },
      {
        message: "lokasiUuid wajib diisi untuk antrian poli.",
        path: ["lokasiUuid"],
      }
    );

  // Skema untuk memvalidasi parameter UUID di URL
  static ANTRIAN_PARAM = z.object({
    antrian_uuid: CommonSchema.UUID_PARAM,
  });
}
