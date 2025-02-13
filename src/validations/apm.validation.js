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
}
