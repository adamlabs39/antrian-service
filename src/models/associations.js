import { PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";
import AntrianModel from "./antrian.model.js";
import ReportAntrianModel from "./report-antrian.model.js";
import { RawatJalanModel } from "@adameds/model-sdk/pelayanan";
import PencatatTaskIdModel from "./pencatat-task-id.model.js";

export function defineAssociations() {
  PractitionerModel.hasMany(JadwalDokterModel, {
    foreignKey: "practitionerUuid",
    as: "jadwal_dokter",
    constraints: false,
  });

  LayarAntrianModel.belongsToMany(LokasiModel, {
    through: LayarAntrianPoliModel,
    foreignKey: "layarAntrianUuid",
    otherKey: "lokasiUuid",
    as: "location",
    constraints: false,
  });

    PencatatTaskIdModel.belongsTo(RawatJalanModel, {
      foreignKey: "kodeBooking",
      targetKey: "kodeBooking",
    });

  AntrianModel.belongsTo(RawatJalanModel, { foreignKey: "rawatJalanUuid" });
  RawatJalanModel.hasMany(AntrianModel, { foreignKey: "rawatJalanUuid" });

  JadwalDokterModel.hasMany(RawatJalanModel, {
    foreignKey: "jadwalDokterUuid",
    as: "rawat_jalan",
    constraints: false,
  });

  ReportAntrianModel.belongsTo(JadwalDokterModel, {
    foreignKey: "jadwalDokterUuid",
    targetKey: "uuid", 
    as: "jadwalDokter",
    constraints: false,
  });

  JadwalDokterModel.hasMany(ReportAntrianModel, {
    foreignKey: "jadwalDokterUuid",
    sourceKey: "uuid",
    as: "reportAntrian",
    constraints: false,
  });
}