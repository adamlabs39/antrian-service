import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import moment from "moment";
import { TransactionService } from "./transaction.service.js";

export class APMService {
  static async registerPatient({ faskesUuid, body, token, platform }) {
    const checkBody = {
      faskes_uuid: faskesUuid,
      no_identity: body.patient_data?.no_identity,
    };

    const checkResult = await AdmisiClient.checkPatient(checkBody, token);
    console.log("Check Result:", checkResult);
    const isPasienBaru = checkResult === false;
    console.log("Is Pasien Baru:", isPasienBaru);
    return TransactionService.run(async (transaction) => {
      const generatedCodes = await DataAntrianService.processRegistration({
        faskesUuid,
        requestData: body,
        isPasienBaru,
        platform,
        token: token,
        transaction: transaction,
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
            // patient_uuid: checkResult.uuid,
            identity: checkResult.identity,
            no_identity: checkResult.noIdentity,
          },
        };
        console.log("Final Payload for Existing Patient:", finalPayload);
      }

      const pendaftaran = await AdmisiClient.createRawatJalan(
        finalPayload,
        token
      );

      return pendaftaran;
    });
  }

  // FOR MOBILE

  static async registerPatientMobile({ faskesUuid, body, platform }) {
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;
    if (!admisiApiKey) {
      throw new Error("API Key untuk layanan Admisi tidak ditemukan.");
    }

    let tanggalPelayananString;

    if (platform === "APM") {
      tanggalPelayananString = moment().format("YYYY-MM-DD");
    } else {
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

    return TransactionService.run(async (transaction) => {
      const generatedCodes = await DataAntrianService.processRegistration({
        faskesUuid,
        requestData: body,
        isPasienBaru,
        platform,
        token: admisiApiKey,
        tanggalPelayanan: tanggalPelayananString,
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
          ...basePayload,
          patient_data: body.patient_data,
        };
      } else {
        // Pasien lama
        finalPayload = {
          ...basePayload,
          no_rm: body.patient_data.no_rm,
        };
      }

      const pendaftaran = await AdmisiClient.createRawatJalanMobile(
        finalPayload,
        faskesUuid,
        admisiApiKey
      );

      return pendaftaran;
    });
  }
}
