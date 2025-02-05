import LayarAntrianModel from "../models/layar-antrian.model.js";
import { UUIDS } from "../libs/constants.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

export class LayarAntrianSeeder {
  static async seed() {
    console.log("🌱 Seeding LayarAntrian...");

    const layar_types = [1, 2, 3, 4, 5];
    const layar_titles = [
      "Layar 3x3 Panggilan",
      "Layar 3x2 Panggilan",
      "Layar 3 List 3 Panggilan",
      "Layar 2 List 2 Panggilan",
      "1 List 1 Panggilan 1 Gambar",
    ];

    const layarAntrianData = [];

    for (const faskesUuid of UUIDS) {
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * layar_types.length);

        layarAntrianData.push({
          uuid: uuidv7(),
          faskesUuid: faskesUuid,
          namaLayar: `Layar ${i + 1} for ${faskesUuid}`,
          tipeLayar: layar_types[randomIndex],
          judul: layar_titles[randomIndex],
          isAdmisi: Math.random() < 0.5,
          isPoli: Math.random() < 0.5,
          isFarmasi: Math.random() < 0.5,
          flashText: [
            `Pesan Flash 1 untuk ${faskesUuid}`,
            `Pesan Flash 2 untuk ${faskesUuid}`,
          ],
          media: `https://youtube.com/watch?v=${Math.random()
            .toString(36)
            .substring(7)}`,
          status: true,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
          deletedAt: null,
        });
      }
    }

    await LayarAntrianModel.bulkCreate(layarAntrianData);
    console.log("✅ LayarAntrian seeding completed!");
  }
}
