import { uuidv7 } from "uuidv7";
import { UUIDS } from "../libs/constants.js";
import moment from "moment";
import { PegawaiModel } from "@adameds/model-sdk/datamaster";

export class PegawaiSeeder {
  static async seed() {
    console.log("🌱 Seeding Pegawai...");

    const genders = ["Male", "Female"];
    const firstTitles = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."];
    const lastTitles = ["PhD", "M.D.", "S.Ked", null, null];

    const pegawaiData = [];

    for (let i = 0; i < 3; i++) {
      const faskesUuid = UUIDS[Math.floor(Math.random() * UUIDS.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const name = `Pegawai ${i + 1}`;
      const nik = `${Math.floor(
        1000000000000000 + Math.random() * 9000000000000000
      )}`;
      const birthdate = moment()
        .subtract(Math.floor(Math.random() * 40) + 20, "years")
        .format("YYYY-MM-DD");
      const firstTitle =
        firstTitles[Math.floor(Math.random() * firstTitles.length)];
      const lastTitle =
        lastTitles[Math.floor(Math.random() * lastTitles.length)];

      pegawaiData.push({
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
        name,
        nik,
        tipe: 1,
        first_title: firstTitle,
        last_title: lastTitle,
        tanggal_lahir: birthdate,
        gender,
        status: true,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        deletedAt: null,
      });
    }

    await PegawaiModel.bulkCreate(pegawaiData);
    console.log("✅ Pegawai seeding completed!");
  }
}
