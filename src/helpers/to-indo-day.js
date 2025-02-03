import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class ToIndoDay {
  static fromInt(num) {
    if (num < 1 || num > 7) {
      throw new BadRequestException("num must be in the range 1 - 7.");
    }

    const hari = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];
    return hari[num - 1];
  }

  static fromEng(day) {
    const days = {
      Monday: "Senin",
      Tuesday: "Selasa",
      Wednesday: "Rabu",
      Thursday: "Kamis",
      Friday: "Jumat",
      Saturday: "Sabtu",
      Sunday: "Minggu",
    };

    const lowerDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(); // Normalize input

    if (!days[lowerDay]) {
      throw new BadRequestException(
        "Invalid day name. Must be a valid English weekday."
      );
    }

    return days[lowerDay];
  }
}
