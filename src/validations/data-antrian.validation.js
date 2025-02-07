import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";

export class DataAntrianSchema {
  static FILTER_QUERY = z.object({
    nama: z
      .string()
      .min(1, { message: "Nama minimal 1 karakter." })
      .max(255, {
        message: "Nama maksimal tidak bisa terlalu panjang.",
      })
      .optional(),
    batas_tanggal_awal: CommonSchema.STRING_DATE.optional(),
    batas_tanggal_akhir: CommonSchema.STRING_DATE.optional(),
    status: z
      .enum(["antri", "proses", "selesai", "verifikasi"], {
        message: "Invalid status value.",
      })
      .optional(),
  });
}
