import { z } from "zod";

export class CommonSchema {
  /**
   * URL Param
   * e.g. /jadwal-dokter/:uuid
   * uuid: 123e4567-e89b-12d3-a456-426614174000
   */
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
    const time = val.split(".");
    const hour = parseInt(time[0]);
    const minute = parseInt(time[1]);
    if (isNaN(hour) || isNaN(minute)) return false;
    if (hour < 0 || hour > 23) return false;
    if (minute < 0 || minute > 59) return false;
    return true;
  });
}
