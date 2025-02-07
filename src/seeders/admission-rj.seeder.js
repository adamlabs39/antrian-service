import moment from "moment";
import { uuidv7 } from "uuidv7";
import AdmissionRJModel from "../models/admission-rj.model.js";
import { UUIDS } from "../libs/constants.js";

export class AdmissionRJSeeder {
  static async seed() {
    console.log("🌱 Seeding AdmissionRJ...");

    const practitionerUuid = uuidv7();
    const lokasiUuid = uuidv7();
    const faskesUuid = UUIDS[0];
    const patientUuid = uuidv7();

    const admissions = [];
    const numAdmissions = 5;

    for (let i = 0; i < numAdmissions; i++) {
      admissions.push({
        uuid: uuidv7(),
        paymentMethod: 1,
        faskesUuid,
        noreg: `REG-${i + 1}`,
        patientUuid,
        noAntrianAdmisi: `AA-${i + 1}`,
        noAntrianPoli: `AP-${i + 1}`,
        name: `Patient ${i + 1}`,
        noRm: `RM-${i + 1}`,
        gender: "male",

        practitionerUuid,
        lokasiUuid,
        kodeBooking: `KB-${i + 1}`,
        statusRj: 1,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        tanggalDaftar: moment().unix(),
      });
    }

    await AdmissionRJModel.bulkCreate(admissions);
    console.log("✅ AdmissionRJ seeding completed!");
  }
}
