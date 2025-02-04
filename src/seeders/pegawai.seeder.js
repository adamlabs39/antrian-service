import { PegawaiModel } from "@adameds/model-sdk/datamaster";
import { UUIDS } from "../libs/constants.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

export class PegawaiSeeder {
  static async seed() {
    console.log("🌱 Seeding Pegawai...");

    const genders = ["Male", "Female"];
    const firstTitles = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."];
    const lastTitles = ["PhD", "M.D.", "S.Ked", null, null];

    const pegawaiData = [];

    for (const faskesUuid of UUIDS) {
      // Assign employees per faskes
      for (let i = 0; i < 5; i++) {
        // Each faskes gets 5 employees
        pegawaiData.push({
          uuid: uuidv7(),
          faskes_uuid: faskesUuid,
          name: `Pegawai ${i + 1} for ${faskesUuid}`,
          nik: `${Math.floor(
            1000000000000000 + Math.random() * 9000000000000000
          )}`,
          tipe: 1,
          first_title:
            firstTitles[Math.floor(Math.random() * firstTitles.length)],
          last_title: lastTitles[Math.floor(Math.random() * lastTitles.length)],
          tanggal_lahir: moment()
            .subtract(Math.floor(Math.random() * 40) + 20, "years")
            .format("YYYY-MM-DD"),
          gender: genders[Math.floor(Math.random() * genders.length)],
          status: true,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
          deletedAt: null,
        });
      }
    }

    await PegawaiModel.bulkCreate(pegawaiData);
    console.log("✅ Pegawai seeding completed!");
  }
}
