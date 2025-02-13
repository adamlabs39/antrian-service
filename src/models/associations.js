import { PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";
import PencatatTaskIdModel from "./pencatat-task-id.model.js";
import AdmissionRJModel from "./admission-rj.model.js";
import AntrianModel from "./antrian.model.js";

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

PencatatTaskIdModel.belongsTo(AdmissionRJModel, {
  foreignKey: "kodeBooking",
  targetKey: "kodeBooking",
});

AdmissionRJModel.hasMany(PencatatTaskIdModel, {
  foreignKey: "kodeBooking",
  sourceKey: "kodeBooking",
});

AntrianModel.belongsTo(AdmissionRJModel, { foreignKey: "admissionRjUuid" });
AdmissionRJModel.hasMany(AntrianModel, { foreignKey: "admissionRjUuid" });

JadwalDokterModel.hasMany(AdmissionRJModel, {
  foreignKey: "jadwalDokterUuid",
  as: "admission_rj",
  constraints: false,
});
