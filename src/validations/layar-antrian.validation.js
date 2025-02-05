import { z } from "zod";
import { TipeLayar } from "../helpers/tipe-layar.js";
import { CommonSchema } from "./common-schema.validation.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class LayarAntrianSchema {
  static FILTER_QUERY = z.object({
    page: z.number().optional(),
    page_size: z.number().optional(),
    aktif: CommonSchema.TRUE_FALSE_UNDEFINED_STRING.optional(),
    tipe_layar: z
      .string()
      .transform((val) => (val ? TipeLayar.toInt(val) : undefined))
      .optional(),
    nama: z.string().optional(),
  });

  static LAYAR_ANTRIAN_PARAM = z.object({
    layar_antrian_uuid: CommonSchema.UUID_PARAM,
  });

  static MANDATORY = z.object({
    nama_layar: z
      .string()
      .min(1, {
        message: "Nama layar tidak boleh kosong",
      })
      .max(255, {
        message: "Nama layar tidak bisa terlalu panjang!",
      }),
    tipe_layar: z
      .number()
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
      .string()
      .min(1, {
        message: "Judul layar tidak boleh kosong",
      })
      .max(255, {
        message: "Judul layar tidak boleh terlalu panjang!",
      }),
    is_admisi: z.boolean(),
    is_poli: z.boolean(),
    is_farmasi: z.boolean(),
    flash_text: z.array(z.string()).nullable().optional(),
    media: z
      .string()
      .min(1, {
        message: "Media tidak boleh kosong",
      })
      .max(255, {
        message: "Media tidak boleh terlalu panjang!",
      })
      .nullable()
      .optional(),
    aktif: z.boolean(),
    poli_uuids: z.array(CommonSchema.UUID_PARAM).nullable().optional(),
  });

  static CREATE = LayarAntrianSchema.MANDATORY.refine((val) => {
    if (!val.is_admisi && !val.is_poli && !val.is_farmasi) {
      throw new BadRequestException("Minimal salah satu harus dipilih");
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

  static UPDATE = LayarAntrianSchema.MANDATORY.partial();

  static DELETE_PARAM = LayarAntrianSchema.UPDATE_PARAM;
}
