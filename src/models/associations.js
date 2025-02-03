import {
  PractitionerModel,
  LokasiModel,
  PractitionerPoliModel,
} from "@adameds/model-sdk/datamaster";
import { JadwalDokterModel } from "@adameds/model-sdk/antrian";

PractitionerModel.hasMany(JadwalDokterModel, {
  foreignKey: "practitionerUuid",
  as: "jadwal_dokter",
  constraints: false,
});

PractitionerModel.belongsToMany(LokasiModel, {
  through: PractitionerPoliModel,
  foreignKey: "practitioner_uuid",
  otherKey: "lokasi_uuid",
  as: "locations",
  constraints: false,
});
