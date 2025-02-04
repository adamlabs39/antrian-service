import { LokasiModel } from "@adameds/model-sdk/datamaster";
import { UUIDS } from "../libs/constants.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

export class LokasiSeeder {
  static async seed() {
    console.log("🌱 Seeding Lokasi...");

    const status_operasional_list = ["Active", "Inactive", "Under Maintenance"];
    const location_types = ["site", "branch", "center"];
    const class_codes = ["A", "B", "C", "D"];
    const class_names = ["Primary", "Secondary", "Tertiary"];

    const lokasiData = [];

    for (const faskesUuid of UUIDS) {
      for (let i = 0; i < 3; i++) {
        lokasiData.push({
          uuid: uuidv7(),
          faskes_uuid: faskesUuid,
          code: `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
          name: `Lokasi ${i + 1} for ${faskesUuid}`,
          description: `Description for ${faskesUuid}`,
          phone: `+62 812-34${Math.floor(10000 + Math.random() * 90000)}`,
          email: `lokasi${i + 1}@example.com`,
          url: `https://lokasi${i + 1}.example.com`,
          status_operasional:
            status_operasional_list[
              Math.floor(Math.random() * status_operasional_list.length)
            ],
          satu_sehat_id: uuidv7(),
          organization_ihs_number: `IHS-${Math.floor(
            10000 + Math.random() * 90000
          )}`,
          location_type:
            location_types[Math.floor(Math.random() * location_types.length)],
          class_code:
            class_codes[Math.floor(Math.random() * class_codes.length)],
          class_name:
            class_names[Math.floor(Math.random() * class_names.length)],
          code_antrian_poli: `POLI-${Math.floor(100 + Math.random() * 900)}`,
          is_poli: Math.random() < 0.5,
          status: true,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
          deletedAt: null,
        });
      }
    }

    await LokasiModel.bulkCreate(lokasiData);
    console.log("✅ Lokasi seeding completed!");
  }
}
