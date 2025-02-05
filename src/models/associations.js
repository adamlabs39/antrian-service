import {
  PractitionerModel,
  LokasiModel,
  PractitionerPoliModel,
} from "@adameds/model-sdk/datamaster";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";

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
