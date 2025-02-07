import { uuidv7 } from "uuidv7";
import AntrianModel from "../models/antrian.model.js";
import moment from "moment";
import AdmissionRJModel from "../models/admission-rj.model.js";

export class AntrianSeeder {
  static async seed() {
    console.log("🌱 Seeding Antrian...");

    const admissions = await AdmissionRJModel.findAll();

    for (const admission of admissions) {
      await AntrianModel.create({
        uuid: uuidv7(),
        admissionRjUuid: admission.uuid,
        pelayanan: "farmasi",
        jenisResep: "R01",
        faskesUuid: admission.faskesUuid,
        patientUuid: admission.patientUuid,
        jenisPasien: "JKN",
        statusPanggilan: 1,
        pasienBaru: true,
        createdAt: moment().startOf("day").unix(),
        kodeBooking: admission.kodebooking,
      });

      await AntrianModel.create({
        uuid: uuidv7(),
        admissionRjUuid: admission.uuid,
        pelayanan: "poli",
        faskesUuid: admission.faskesUuid,
        patientUuid: admission.patientUuid,
        statusPanggilan: 1,
        jenisPasien: "NON JKN",
        pasienBaru: false,
        createdAt: moment().unix(),
        kodeBooking: admission.kodebooking,
      });
    }

    console.log("✅ Antrian seeding completed!");
  }
}
