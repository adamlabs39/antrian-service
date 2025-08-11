import { z } from "zod";
import { TipeLayar } from "../helpers/tipe-layar.js";
import { CommonSchema } from "./common-schema.validation.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class LayarAntrianSchema {
  static FILTER_QUERY = z.object({
    page: z.coerce.number().int().positive().optional(),
    page_size: z.coerce.number().int().positive().optional(),
    status: CommonSchema.TRUE_FALSE_UNDEFINED_STRING.optional(),
    tipe_layar: z.coerce.number().int().positive().optional(),
    nama_layar: z.string().trim().min(1).optional(),
  });

  static LAYAR_ANTRIAN_PARAM = z.object({
    layar_antrian_uuid: CommonSchema.UUID_PARAM,
  });

  static MANDATORY = z.object({
    nama_layar: z
      .string({
        required_error: "Nama layar wajib diisi.",
        invalid_type_error: "Nama layar harus berupa teks.",
      })
      .trim()
      .min(1, {
        message: "Nama layar tidak boleh kosong",
      })
      .max(255, {
        message: "Nama layar tidak bisa terlalu panjang!",
      }),
    tipe_layar: z
      .number({
        required_error: "Tipe layar wajib diisi.",
        invalid_type_error: "Tipe layar harus berupa angka.",
      })
      .int({
        message: "Tipe layar tidak boleh kosong",
      })
      .min(1, {
        message: "Tipe layar harus lebih dari 0",
      })
      .max(5, {
        message: "Tipe layar tidak boleh lebih dari 5",
      }),
    judul: z
      .string({
        required_error: "Judul wajib diisi.",
        invalid_type_error: "Judul harus berupa teks.",
      })
      .trim()
      .min(1, {
        message: "Judul layar tidak boleh kosong",
      })
      .max(255, {
        message: "Judul layar tidak boleh terlalu panjang!",
      }),
    is_admisi: z.boolean().default(false),
    is_poli: z.boolean().default(false),
    is_farmasi: z.boolean().default(false),
    flash_text: z.array(z.string()).nullable().optional(),
    media: z
      .string()
      .trim()
      .url({
        message: "Media harus berupa URL yang valid",
      })
      .min(1, {
        message: "Media tidak boleh kosong",
      })
      .max(255, {
        message: "Media tidak boleh terlalu panjang!",
      })
      .nullable()
      .optional(),
    status: z.boolean(),
    poli_uuids: z.array(CommonSchema.UUID_PARAM).nullable().optional(),
  });

  static CREATE = LayarAntrianSchema.MANDATORY.refine((val) => {
    if (!val.is_admisi && !val.is_poli && !val.is_farmasi) {
      throw new BadRequestException("Minimal harus memilih satu jenis layar");
    }

    if (val.is_poli && !val.poli_uuids) {
      throw new BadRequestException(
        "Jika memilih poliklinik, poliklinik harus minimal 1"
      );
    }

    if (val.is_poli && val.poli_uuids.length === 0) {
      throw new BadRequestException("Jika memilih poliklinik, minimal 1");
    }

    return true;
  });

  static UPDATE = LayarAntrianSchema.MANDATORY.partial().refine((val) => {
    if (
      val.is_poli === true &&
      (!val.poli_uuids || val.poli_uuids.length === 0)
    ) {
      throw new BadRequestException(
        "Jika jenis diubah menjadi poli, daftar poliklinik (poli_uuids) wajib diisi minimal 1."
      );
    }
    return true;
  });

  static DELETE_PARAM = LayarAntrianSchema.UPDATE_PARAM;
}
