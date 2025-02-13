import moment from "moment";
import { uuidv7 } from "uuidv7";
import { UUIDS } from "../libs/constants.js";
import { PatientModel, BirthDetailModel } from "@adameds/model-sdk/admisi";

export class BirthDetailSeeder {
  static async seed() {
    console.log("🌱 Seeding Birth Details...");

    const patients = await PatientModel.findAll({
      attributes: ["uuid", "birthDetailUuid", "faskesUuid"],
    });

    const birthDetails = patients.map((patient, index) => ({
      uuid: patient.birthDetailUuid,
      faskesUuid: patient.faskesUuid,
      birthPlace: `City ${index + 1}`,
      birthDate: moment()
        .subtract(20 + index, "years")
        .format("YYYY-MM-DD"), // Random birth date
      ageYear: 20 + index,
      ageMonth: (index % 12) + 1,
      ageDay: (index % 30) + 1,
      faskesUuid: UUIDS[0], // Assuming a predefined faskes_uuid
      createdAt: moment().unix(),
      updatedAt: moment().unix(),
    }));

    await BirthDetailModel.bulkCreate(birthDetails);
    console.log("✅ Birth Detail seeding completed!");
  }
}
