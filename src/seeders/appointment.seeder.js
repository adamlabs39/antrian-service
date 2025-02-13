import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import { uuidv7 } from "uuidv7";
import moment from "moment";
import AppointmentModel from "../models/appointment.model.js";

export class AppointmentSeeder {
  static async seed() {
    console.log("🌱 Seeding Appointments...");

    const schedules = await JadwalDokterModel.findAll({
      attributes: [
        "uuid",
        "practitionerUuid",
        "lokasiUuid",
        "faskesUuid",
        "day",
        "start_time",
        "end_time",
        "kuotaJkn",
        "kuotaNonJkn",
      ],
    });

    if (!schedules.length) {
      console.error("❌ No schedules found! Seeding aborted.");
      return;
    }

    const appointments = [];
    const statuses = ["pending", "confirmed", "cancelled", "completed"];

    for (const schedule of schedules) {
      const totalAppointments = Math.floor(
        Math.random() * (schedule.kuotaJkn + schedule.kuotaNonJkn)
      );

      for (let i = 0; i < totalAppointments; i++) {
        appointments.push({
          uuid: uuidv7(),
          faskesUuid: schedule.faskesUuid,
          dokterUuid: schedule.practitionerUuid,
          lokasiUuid: schedule.lokasiUuid,
          jadwalDokterUuid: schedule.uuid,
          status: Math.floor(Math.random() * statuses.length),
          patientName: `Patient_${i + 1}`,
          appointmentTime: moment()
            .add(i, "days")
            .format("YYYY-MM-DD HH:mm:ss"),
          createdAt: moment().unix(),
          updatedAt: null,
          deletedAt: null,
          accountUuid: uuidv7(),
          tanggalDaftar: moment().startOf("day").unix(),
          jadwalPraktek: moment().startOf("day").unix(),
          kodeBooking: `KB-${i + 1}-${schedule.practitionerUuid}`,
          noAntrian: `AN-${i + 1}`,
          noAntrianPoli: `AP-${i + 1}`,
          noAntrianFarmasi: `AF-${i + 1}`,
        });
      }
    }

    await AppointmentModel.bulkCreate(appointments);
    console.log("✅ Appointments seeding completed!");
  }
}
