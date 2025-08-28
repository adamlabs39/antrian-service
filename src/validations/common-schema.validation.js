import { z } from "zod";

export class CommonSchema {

  static UUID_PARAM = z.string().uuid({
    message: "Invalid UUID format.",
  });

  static STRING_DATE = z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid date format.",
    })
    .transform((val) => new Date(val));

  static ACTIVE_ENUM = z.enum(["aktif", "non aktif"], {
    message: "Invalid status value.",
  });

  static TIME = z.string().refine((val) => {
    const time = val.split(":");
    const hour = parseInt(time[0]);
    const minute = parseInt(time[1]);
    if (isNaN(hour) || isNaN(minute)) return false;
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    return true;
  });

  static STRING_MUST_NUMBER = z.string().regex(/^\d+$/);

  static STRING_TO_NUMBER = this.STRING_MUST_NUMBER.transform((val) =>
    isNaN(Number(val)) ? undefined : Number(val)
  );

  static TRUE_FALSE_UNDEFINED_STRING = z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, z.boolean().optional());
}
