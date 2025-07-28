import AppointmentModel from "../models/appointment.model.js";
import { Op } from "sequelize";

export class AppointmentRepository {
 
  static async countByJadwalDokterUuids({ 
    faskesUuid, 
    jadwalDokterUuids,
    transaction,
   }) {
    return AppointmentModel.count({
      where: {
        faskesUuid,
        jadwalDokterUuid: {
          [Op.in]: jadwalDokterUuids,
        },
        status: {
          [Op.ne]: 0,
        },
        deletedAt: null,
      },
        transaction,
   });
  }

  static async getKodeBookingsMobileTodayByUuids({
    faskesUuid,
    jadwalDokterUuids,
  }) {
    const whereClause = {
      faskesUuid,
      jadwalDokterUuid: jadwalDokterUuids,
      deletedAt: null,
      status: [1, 2],
    };

    const result = await AppointmentModel.findAll({
      where: whereClause,
      raw: true,
      nest: true,
      subQuery: false,
      attributes: ["kodeBooking", "jadwalDokterUuid"],
    });

    console.log(result);
    const formatted = {};
    for (const pair of result) {
      if (!formatted[pair.jadwalDokterUuid]) {
        formatted[pair.jadwalDokterUuid] = new Set();
        formatted[pair.jadwalDokterUuid].add(pair.kodeBooking);
      } else {
        formatted[pair.jadwalDokterUuid].add(pair.kodeBooking);
      }
    }

    // convert Set to Array
    for (const key in formatted) {
      formatted[key] = Array.from(formatted[key]);
    }

    return formatted;
  }
}
