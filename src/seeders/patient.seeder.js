import moment from "moment";
import { uuidv7 } from "uuidv7";

import { UUIDS } from "../libs/constants.js";
import { PatientModel } from "@adameds/model-sdk/admisi";
import AdmissionRJModel from "../models/admission-rj.model.js";

export class PatientSeeder {
  static async seed() {
    console.log("🌱 Seeding Patients...");

    // Fetch existing admissions to get kodeBooking and patientUuid
    const admissions = await AdmissionRJModel.findAll({
      attributes: [
        "patientUuid",
        "kodeBooking",
        "noRm",
        "name",
        "gender",
        "faskesUuid",
      ],
    });

    console.log("admissions", admissions);
    const patients = admissions.map((admission) => ({
      uuid: admission.patientUuid,
      satuSehatUuid: uuidv7(),
      faskesUuid: admission.faskesUuid,
      noRm: admission.noRm,
      name: admission.name,
      gender: admission.gender,
      identity: "KTP",
      noIdentity: `${Math.floor(100000 + Math.random() * 900000)}`,
      birthDetailUuid: uuidv7(),
      phone: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
      addressUuid: uuidv7(),
      createdAt: moment().unix(),
      updatedAt: moment().unix(),
    }));

    await PatientModel.bulkCreate(patients);
    console.log("✅ Patient seeding completed!");
  }
}
