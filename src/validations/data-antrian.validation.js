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
      // tipeAntrian: z.enum(["admisi", "poli", "farmasi"], {
      //   required_error: "Tipe antrian wajib diisi.",
      // }),
      pasien_baru: z.boolean({
        required_error: "Status pasien baru wajib diisi.",
      }),
      patient_uuid: CommonSchema.UUID_PARAM,
      jenis_pasien: z.string({
        required_error: "Jenis pasien wajib diisi.",
      }),
      dokter_uuid: CommonSchema.UUID_PARAM.optional(),
      // admissionUuid: CommonSchema.UUID_PARAM.optional(),
      lokasi_uuid: CommonSchema.UUID_PARAM.optional(), // Wajib ada jika tipeAntrian = 'poli'
      // admission_uuid: CommonSchema.UUID_PARAM,
    })
    .refine(
      (data) => {
        if (
          data.pasien_baru === false &&
          (!data.dokter_uuid || !data.lokasi_uuid)
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Dokter dan Lokasi wajib diisi untuk pasien lama.",
        path: ["dokterUuid", "lokasiUuid"],
      }
    );

  // Skema untuk memvalidasi parameter UUID di URL
  static ANTRIAN_PARAM = z.object({
    antrian_uuid: CommonSchema.UUID_PARAM,
  });
}
