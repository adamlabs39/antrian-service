import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import { LokasiModel, PractitionerModel } from "@adameds/model-sdk/datamaster";
import moment from "moment";
import { uuidv7 } from "uuidv7";

export class JadwalDokterSeeder {
  static async seed() {
    console.log("🌱 Seeding JadwalDokter...");

    const practitioners = await PractitionerModel.findAll({
      attributes: ["uuid", "faskes_uuid", "code_antrian_dokter", "is_doctor"],
    });
    const locations = await LokasiModel.findAll({
      attributes: ["uuid", "faskes_uuid", "code_antrian_poli", "is_poli"],
    });

    if (!practitioners.length || !locations.length) {
      console.error("❌ No practitioners or locations found! Seeding aborted.");
      return;
    }

    const schedules = [];
    const days = [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ];

    for (const practitioner of practitioners) {
      const relatedLocations = locations.filter(
        (l) => l.faskes_uuid === practitioner.faskes_uuid
      );
      if (!relatedLocations.length) continue;
      if (!practitioner.is_doctor) continue;

      // Each doctor gets 1 schedules
      for (let i = 0; i < 2; i++) {
        const chosenLocation =
          relatedLocations[Math.floor(Math.random() * relatedLocations.length)];
        if (!chosenLocation) continue;
        if (!chosenLocation.is_poli) continue;
        if (Math.random() < 0.5) continue;
        schedules.push({
          uuid: uuidv7(),
          faskesUuid: practitioner.faskes_uuid,
          practitionerUuid: practitioner.uuid,
          lokasiUuid: chosenLocation.uuid,
          day: days[Math.floor(Math.random() * days.length)],
          start_time: "08:00:00",
          end_time: "16:00:00",
          status: true,
          createdAt: moment().unix(),
          kuota: 10,
          kuotaNonJkn: 5,
          kuotaJkn: 5,
          durasiPelayanan: 30,
          codeAntrianPoli: chosenLocation.code_antrian_poli,
          codeAntrianDokter: practitioner.code_antrian_dokter,
          updatedAt: null,
          deletedAt: null,
        });
      }
    }

    await JadwalDokterModel.bulkCreate(schedules);
    console.log("✅ JadwalDokter seeding completed!");
  }
}
