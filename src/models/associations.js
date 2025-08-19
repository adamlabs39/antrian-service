import { PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";
import PencatatTaskIdModel from "./pencatat-task-id.model.js";
import AdmissionRJModel from "./admission-rj.model.js";
import AntrianModel from "./antrian.model.js";
import ReportAntrianModel from "./report-antrian.model.js";

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

  // Menghubungkan ReportAntrian ke JadwalDokter
  ReportAntrianModel.belongsTo(JadwalDokterModel, {
    foreignKey: "jadwalDokterUuid",
    targetKey: "uuid", // Menghubungkan ke kolom 'uuid' di jadwal_dokter
    as: "jadwalDokter",
    constraints: false,
  });

  // (Opsional) Relasi sebaliknya dari JadwalDokter ke ReportAntrian
  JadwalDokterModel.hasMany(ReportAntrianModel, {
    foreignKey: "jadwalDokterUuid",
    sourceKey: "uuid",
    as: "reportAntrian",
    constraints: false,
  });
}