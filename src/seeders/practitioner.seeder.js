import { uuidv7 } from "uuidv7";
import { UUIDS } from "../libs/constants.js";
import moment from "moment";
import { PegawaiModel } from "@adameds/model-sdk/datamaster";
import { PractitionerModel } from "@adameds/model-sdk/datamaster";

export class PractitionerSeeder {
  static async seed() {
    console.log("🌱 Seeding Practitioner...");

    const pegawaiList = await PegawaiModel.findAll({ attributes: ["uuid"] });

    if (!pegawaiList.length) {
      console.error("❌ No pegawai found! Seeding aborted.");
      return;
    }

    const practitioners = [];

    for (let i = 0; i < 10; i++) {
      const pegawai =
        pegawaiList[Math.floor(Math.random() * pegawaiList.length)];
      const faskesUuid = UUIDS[Math.floor(Math.random() * UUIDS.length)];

      practitioners.push({
        uuid: uuidv7(),
        faskes_uuid: faskesUuid,
        pegawai_uuid: pegawai.uuid,
        sip: `SIP-${Math.floor(1000 + Math.random() * 9000)}`,
        str: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
        code_bpjs: `BPJS-${Math.floor(10000 + Math.random() * 90000)}`,
        satu_sehat_id: uuidv7(),
        is_doctor: Math.random() < 0.8,
        code_antrian_dokter: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        status: true,
        createdAt: moment().unix(),
        updatedAt: moment().unix(),
        deletedAt: null,
      });
    }

    await PractitionerModel.bulkCreate(practitioners);
    console.log("✅ Practitioner seeding completed!");
  }
}
