import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import moment from "moment";

export class APMService {
  // static async checkPatientStatus({body, token }) {
  //   return await AdmisiClient.checkPatient(body, token);
  // }

  static async registerPatient({ faskesUuid, body, token, platform }) {
    const checkBody = {
      faskes_uuid: faskesUuid,
      no_identity: body.patient_data?.no_identity,
    };

    console.log("Check Patient Body:", checkBody);

    const checkResult = await AdmisiClient.checkPatient(checkBody, token);
    console.log("Check Patient Result:", checkResult);

    const isPasienBaru = checkResult === false;
    console.log("Is Pasien Baru:", isPasienBaru);

    const generatedCodes = await DataAntrianService.processRegistration({
      faskesUuid,
      requestData: body,
      isPasienBaru,
      platform,
      // transaction: tx
    });

    const basePayload = {
      platform: platform,
      jadwal_dokter_uuid: body.jadwal_dokter_uuid,
      ...generatedCodes,
    };

    let finalPayload;
    if (isPasienBaru) {
      // Untuk pasien baru
      finalPayload = {
        patient_data: {
          identity: body.patient_data.identity,
          no_identity: body.patient_data.no_identity,
        },
        ...basePayload,
      };
      console.log("Final Payload for New Patient:", finalPayload);
    } else {
      // Pasien lama
      finalPayload = {
        ...basePayload,
        patient_data: {
          uuid: checkResult.uuid,
          identity: checkResult.identity, // <-- Tambahkan ini
          no_identity: checkResult.noIdentity, // <-- Tambahkan ini
        },
      };
      console.log("Final Payload for Existing Patient:", finalPayload);
    }

    const pendaftaran = await AdmisiClient.createRawatJalan(
      finalPayload,
      token
    );

    return pendaftaran;
  }

  // FOR MOBILE

  static async registerPatientMobile({ faskesUuid, body, platform }) {
    const admisiApiKey =
      "90bc209559363a69d4cc2c77c4dca75b6e1387ecc6b07162b41663a2b19df143";
    console.log("faskesUuid service apm:", faskesUuid);
    console.log("platform service apm:", platform);
    if (!admisiApiKey) {
      throw new Error("API Key untuk layanan Admisi tidak ditemukan.");
    }

    let tanggalPelayananString;

    // Aturan Bisnis: Jika platform APM, selalu hari ini. Jika MOBILE, ambil dari body.
    if (platform === "APM") {
      tanggalPelayananString = moment().format("YYYY-MM-DD");
      console.log(
        "Platform APM, tanggal diatur ke hari ini:",
        tanggalPelayananString
      );
    } else {
      // Untuk MOBILE atau platform lain, ambil dari body.
      tanggalPelayananString =
        body.tanggal_pelayanan || moment().format("YYYY-MM-DD");
    }

    // Validasi format tanggal yang sudah ditentukan.
    if (!moment(tanggalPelayananString, "YYYY-MM-DD", true).isValid()) {
      throw new BadRequestException(
        "Format tanggal_pelayanan tidak valid. Gunakan format YYYY-MM-DD."
      );
    }

    const isPasienBaru = body.patient_data?.no_rm == null;
    console.log("Is Pasien Baru (Mobile):", isPasienBaru);

    console.log("body mobile:", body);
    const generatedCodes = await DataAntrianService.processRegistration({
      faskesUuid,
      requestData: body,
      isPasienBaru,
      platform,
      token: admisiApiKey,
      tanggalPelayanan: tanggalPelayananString,
    });
    console.log("Generated Codes:", generatedCodes);

    const basePayload = {
      platform: platform,
      jadwal_dokter_uuid: body.jadwal_dokter_uuid,
      ...generatedCodes,
    };

    let finalPayload;
    if (isPasienBaru) {
      // Untuk pasien baru
      finalPayload = {
        ...basePayload,
        patient_data: body.patient_data,
      };
      console.log("Final Payload for New Patient:", finalPayload);
    } else {
      // Pasien lama
      finalPayload = {
        ...basePayload,
        no_rm: body.patient_data.no_rm,
      };
      console.log("Final Payload for Existing Patient:", finalPayload);
    }

    const pendaftaran = await AdmisiClient.createRawatJalanMobile(
      finalPayload,
      faskesUuid,
      admisiApiKey
    );

    return pendaftaran;
  }
}
