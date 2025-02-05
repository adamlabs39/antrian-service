import { z } from "zod";

export class LayarAntrianSchema {
  static FILTER_QUERY = {
    page: z.number().optional(),
    page_size: z.number().optional(),
    status: z.string().optional(),
    tipe_layar: z.string().optional(),
  };
}
