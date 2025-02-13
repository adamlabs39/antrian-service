import { z } from "zod";
import { CommonSchema } from "./common-schema.validation.js";

export class APMSchema {
  static GET_BY_IDENTITY_PARAM = z.object({
    identity: z.string(),
  });

  static GET_BY_IDENTITY_QUERY = z.object({
    bpjs: CommonSchema.TRUE_FALSE_UNDEFINED_STRING.optional(),
  });

  static POLI_UUID_PARAM = z.object({
    poli_uuid: CommonSchema.UUID_PARAM,
  });

  static JADWAL_DOKTER_PARAM = z.object({
    jadwal_dokter_uuid: CommonSchema.UUID_PARAM,
  });

  static CREATE_APPOINTMENT_BODY = z.object({
    jadwal_dokter_uuid: z.string().uuid(),
    patient_uuid: z.string().uuid(),
    no_bpjs: z.string(),
    no_identitas: z.string(),
    nama: z
      .string()
      .min(1, {
        message: "Nama tidak boleh kosong.",
      })
      .max(255, {
        message: "Nama tidak boleh terlalu panjang.",
      }),
    tanggal_lahir: z.number().int(),
    jenis_kelamin: z.enum(["L", "P"]),
  });
}
