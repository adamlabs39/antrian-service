import { LokasiModel } from "@adameds/model-sdk/datamaster";
import { UUIDS } from "../libs/constants.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";
import LayarAntrianModel from "../models/layar-antrian.model.js";
import LayarAntrianPoliModel from "../models/layar-antrian-poli.model.js";

export class LayarAntrianPoliSeeder {
  static async seed() {
    console.log("🌱 Seeding LayarAntrianPoli...");

    const layarAntrianPoliData = [];

    for (const faskesUuid of UUIDS) {
      // Fetch lokasi UUIDs that belong to the same faskes_uuid
      const lokasiList = await LokasiModel.findAll({
        where: { faskes_uuid: faskesUuid },
        attributes: ["uuid"],
        raw: true,
      });

      // Fetch layar antrian UUIDs that belong to the same faskes_uuid
      const layarAntrianList = await LayarAntrianModel.findAll({
        where: { faskesUuid: faskesUuid },
        attributes: ["uuid", "isPoli"],
        raw: true,
      });

      if (lokasiList.length === 0 || layarAntrianList.length === 0) continue;

      for (let i = 0; i < 3; i++) {
        const lokasi_uuid =
          lokasiList[Math.floor(Math.random() * lokasiList.length)].uuid;
        const layarAntrian =
          layarAntrianList[Math.floor(Math.random() * layarAntrianList.length)];

        if (!layarAntrian.isPoli) continue;

        layarAntrianPoliData.push({
          uuid: uuidv7(),
          faskesUuid: faskesUuid,
          lokasiUuid: lokasi_uuid,
          layarAntrianUuid: layarAntrian.uuid,
          createdAt: moment().unix(),
          updatedAt: moment().unix(),
          deletedAt: null,
        });
      }
    }

    await LayarAntrianPoliModel.bulkCreate(layarAntrianPoliData);
    console.log("✅ LayarAntrianPoli seeding completed!");
  }
}
