import { z } from "zod";
import { TipeLayar } from "../helpers/tipe-layar.js";
import { CommonSchema } from "./common-schema.validation.js";

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
}
