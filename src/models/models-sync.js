import { JadwalDokterModel } from "@adameds/model-sdk/antrian";
import LayarAntrianModel from "./layar-antrian.model.js";
import LayarAntrianPoliModel from "./layar-antrian-poli.model.js";
import AntrianModel from "./antrian.model.js";
import {
  PractitionerModel,
  LokasiModel,
  PegawaiModel,
} from "@adameds/model-sdk/datamaster";
import AdmissionRJModel from "./admission-rj.model.js";
import PencatatTaskIdModel from "./pencatat-task-id.model.js";
import { PatientModel, BirthDetailModel } from "@adameds/model-sdk/admisi";
import AppointmentModel from "./appointment.model.js";

export const MODELS = [
  JadwalDokterModel,
  PractitionerModel,
  LayarAntrianModel,
  LayarAntrianPoliModel,
  LokasiModel,
  PegawaiModel,
  AdmissionRJModel,
  AntrianModel,
  PencatatTaskIdModel,
  PatientModel,
  BirthDetailModel,
  AppointmentModel,
];
