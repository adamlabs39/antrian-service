import { compareSync } from "bcrypt";
import { PatientRepository } from "../repositories/patient.repository.js";
import { APMSchema } from "../validations/apm.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { Sequelize } from "sequelize";
import { sequelize } from "../configurations/db.js";
import { CodeGenerator } from "../helpers/code-generator.js";
import { AdmissionRJRepository } from "../repositories/admission-rj.repository.js";

export class APMService {
  static async getDataByIdentity({ faskesUuid, query, params }) {
    const { identity } = ZodValidator.validate(
      APMSchema.GET_BY_IDENTITY_PARAM,
      params
    );

    const { bpjs: includeBPJS } = ZodValidator.validate(
      APMSchema.GET_BY_IDENTITY_QUERY,
      query
    );

    const data = await PatientRepository.findDetailByIdentity({
      faskesUuid,
      identity,
    });

    if (!data) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    const formattedData = {
      noIdentitas: data.noIdentity,
      nama: data.name,
      noRm: data.noRm,
      tanggalLahir: new Date(data.birth_detail.birthDate).getTime() / 1000,
      jenisKelamin: data.gender,
    };

    if (includeBPJS) {
      formattedData.bpjs = "BPJS MASIH DUMMY";
    }

    return formattedData;
  }

  static async getAvailableSchedule({ faskesUuid, params }) {
    const { poli_uuid: poliUuid } = ZodValidator.validate(
      APMSchema.POLI_UUID_PARAM,
      params
    );

    // inside this still not correct
    const jadwalDokter = await JadwalDokterRepository.findAllByLocationToday({
      faskesUuid,
      poliUuid,
    });

    const jadwalDokterUuids = jadwalDokter.map((jadwal) => jadwal.uuid);

    const listKodeBookingByAPM =
      await JadwalDokterRepository.getKodeBookingsAPMTodayByUuids({
        faskesUuid,
        jadwalDokterUuids,
      });

    const listKodeBookingByMobile =
      await AppointmentRepository.getKodeBookingsMobileTodayByUuids({
        faskesUuid,
        jadwalDokterUuids,
      });

    const kodeBookingGroupedByJadwal = {};

    // for each key in listKodeBookingByAPM, add the value to kodeBookingGroupedByJadwal
    for (const key in listKodeBookingByAPM) {
      kodeBookingGroupedByJadwal[key] = {};

      kodeBookingGroupedByJadwal[key]["jkn"] = new Set(
        listKodeBookingByAPM[key]["jkn"]
      );
      kodeBookingGroupedByJadwal[key]["nonJkn"] = new Set(
        listKodeBookingByAPM[key]["nonJkn"]
      );
    }

    // for each key in listKodeBookingByMobile, add the value to kodeBookingGroupedByJadwal if the key exists otherwise create a new key
    for (const key in listKodeBookingByMobile) {
      if (!kodeBookingGroupedByJadwal[key]) {
        kodeBookingGroupedByJadwal[key]["jkn"] = new Set();
        kodeBookingGroupedByJadwal[key]["nonJkn"] = new Set();
      }

      for (const kodeBooking of listKodeBookingByMobile[key]) {
        kodeBookingGroupedByJadwal[key]["nonJkn"].add(kodeBooking);
      }
    }

    // convert Set to Array
    for (const key in kodeBookingGroupedByJadwal) {
      kodeBookingGroupedByJadwal[key]["jkn"] = Array.from(
        kodeBookingGroupedByJadwal[key]["jkn"]
      );
      kodeBookingGroupedByJadwal[key]["nonJkn"] = Array.from(
        kodeBookingGroupedByJadwal[key]["nonJkn"]
      );
    }

    for (const eachJadwalDokter of jadwalDokter) {
      eachJadwalDokter["sisa_kuota_jkn"] = eachJadwalDokter.kuotaJkn;
      eachJadwalDokter["sisa_kuota_non_jkn"] = eachJadwalDokter.kuotaNonJkn;
      if (kodeBookingGroupedByJadwal[eachJadwalDokter.uuid]) {
        eachJadwalDokter["sisa_kuota_jkn"] -=
          kodeBookingGroupedByJadwal[eachJadwalDokter.uuid]["jkn"].length;
        kodeBookingGroupedByJadwal[eachJadwalDokter.uuid]["jkn"];
        eachJadwalDokter["sisa_kuota_non_jkn"] -=
          kodeBookingGroupedByJadwal[eachJadwalDokter.uuid]["nonJkn"].length;
      }
    }

    return jadwalDokter;
  }

  static async registerJknAPM({ faskesUuid, body }) {
    const result = await sequelize.transaction(async (t) => {
      console.log("body ", body);
      const validated = ZodValidator.validate(
        APMSchema.CREATE_APPOINTMENT_BODY,
        body
      );

      // Check if the patient is already registered
      const patient = await PatientRepository.findDetailByIdentity({
        faskesUuid,
        identity: validated.no_identitas,
        transaction: t,
      });

      let noRm;
      if (!patient) {
        noRm = AdmissionRJRepository.generateNoRm();
      } else {
        noRm = patient.noRm;
      }

      const noBooking = AdmissionRJRepository.generateKodeBooking({
        faskesUuid,
      });

      const noRegistrasi = AntrianRepository.generateNoUrutRegistrasi({
        faskesUuid,
      });

      return patient;
    });
  }
}
