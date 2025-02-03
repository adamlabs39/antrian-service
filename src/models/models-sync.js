import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";
import AntrianModel from "./antrian.model.js";
import {
  PractitionerModel,
  LokasiModel,
  PegawaiModel,
} from "@adameds/model-sdk/datamaster";

export const MODELS = [
  JadwalDokterModel,
  PractitionerModel,
  LayarAntrianModel,
  LayarAntrianPoliModel,
  LokasiModel,
  PegawaiModel,
  AntrianModel,
];
