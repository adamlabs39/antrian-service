import { uuidv7 } from "uuidv7";
import { UUIDS } from "../libs/constants.js";
import moment from "moment";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import { PractitionerModel } from "@adameds/model-sdk/datamaster";
import { LokasiModel } from "@adameds/model-sdk/datamaster";

export class JadwalDokterSeeder {
  static async seed() {
    console.log("🌱 Seeding JadwalDokter...");

    // Fetch practitioners and locations
    const practitioners = await PractitionerModel.findAll({
      attributes: ["uuid"],
    });
    const locations = await LokasiModel.findAll({ attributes: ["uuid"] });

    if (!practitioners.length || !locations.length) {
      console.error("❌ No practitioners or locations found! Seeding aborted.");
      return;
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const schedules = [];

    for (let i = 0; i < 10; i++) {
      const practitioner =
        practitioners[Math.floor(Math.random() * practitioners.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const faskesUuid = UUIDS[Math.floor(Math.random() * UUIDS.length)];
      const day = days[Math.floor(Math.random() * days.length)];

      schedules.push({
        uuid: uuidv7(),
        faskesUuid,
        practitionerUuid: practitioner.uuid,
        lokasiUuid: location.uuid,
        day,
        start_time: "08:00:00",
        end_time: "16:00:00",
        kuota: Math.floor(Math.random() * 20) + 10,
        kuotaNonJkn: Math.floor(Math.random() * 10) + 5,
        kuotaJkn: Math.floor(Math.random() * 10) + 5,
        durasiPelayanan: 30,
        codeAntrianPoli: `POLI-${Math.floor(Math.random() * 900 + 100)}`,
        codeAntrianDokter: `DOC-${Math.floor(Math.random() * 900 + 100)}`,
        status: true,
        createdAt: moment().unix(),
        updatedAt: null,
        deletedAt: null,
      });
    }

    await JadwalDokterModel.bulkCreate(schedules);
    console.log("✅ JadwalDokter seeding completed!");
  }
}
