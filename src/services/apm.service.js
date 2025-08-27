import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import moment from "moment";
import { TransactionService } from "./transaction.service.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class APMService {
  static async registerPatient({ faskesUuid, body, token, platform }) {
    const patientData = body.patient_data;

    if (!patientData) {
      throw new BadRequestException("Data pasien (patient_data) wajib diisi.");
    }

    // Cek field 'identity'
    if (!patientData.identity) {
      throw new BadRequestException("Jenis identitas wajib diisi.");
    }

    // Cek field 'no_identity'
    if (!patientData.no_identity) {
      throw new BadRequestException("Nomor identitas wajib diisi.");
    }

    const checkBody = {
      faskes_uuid: faskesUuid,
      no_identity: body.patient_data?.no_identity,
    };

    const checkResult = await AdmisiClient.checkPatient(checkBody, token);
    const isPasienBaru = checkResult === false;
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
            patient_uuid: checkResult.uuid,
            identity: checkResult.identity,
            no_identity: checkResult.no_identity,
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

  static async printAntrian({ kodeBooking, token }) {
    const response = await AdmisiClient.printAntrian(
      {
        kode_booking: kodeBooking,
      },
      token
    );
    return response;
  }

  // FOR MOBILE

  static async registerPatientMobile({ faskesUuid, body, platform }) {
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;
    console.log("admisi api key:", admisiApiKey);
    console.log("faskes uuid:", faskesUuid);
    if (!admisiApiKey) {
      throw new Error("API Key untuk layanan Admisi tidak ditemukan.");
    }

    let tanggalPelayananString;
    tanggalPelayananString =
      body.tanggal_pelayanan || moment().format("YYYY-MM-DD");

    // Validasi format tanggal yang sudah ditentukan.
    if (!moment(tanggalPelayananString, "YYYY-MM-DD", true).isValid()) {
      throw new BadRequestException(
        "Format tanggal_pelayanan tidak valid. Gunakan format YYYY-MM-DD."
      );
    }

    const no_rm = body.patient_data?.no_rm;
    const isPasienBaru = no_rm == null || no_rm === "null";
    let checkResult = null;

    if (!isPasienBaru) {
      checkResult = await AdmisiClient.checkPatientMobile(
        {
          faskes_uuid: faskesUuid,
          no_identity: body.patient_data?.no_identity,
        },
        faskesUuid,
        admisiApiKey
      );
      console.log("Check Result Mobile:", checkResult);

      if (!checkResult) {
        throw new NotFoundException(
          `Pasien dengan No. RM ${body.patient_data.no_rm} tidak ditemukan.`
        );
      }
    }

    return TransactionService.run(async (transaction) => {
      const generatedCodes = await DataAntrianService.processRegistration({
        faskesUuid,
        requestData: body,
        isPasienBaru,
        platform,
        token: admisiApiKey,
        tanggalPelayanan: tanggalPelayananString,
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
          ...basePayload,
          patient_data: body.patient_data,
        };
      } else {
        // Pasien lama
        finalPayload = {
          ...basePayload,
          patient_data: {
            ...body.patient_data,
            patient_uuid: checkResult.uuid,
          },
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

  //fungsi untuk checkin pasien yang mendaftar dari mobile melalui apm
  static async checkInPatient({ kodeBooking, token }) {
    const response = await AdmisiClient.checkInBooking(
      {
        kode_booking: kodeBooking,
      },
      token
    );
    return response;
  }
}
