import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import moment from "moment";
import { TransactionService } from "./transaction.service.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";

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

    // Hitung tanggal hari ini (karena APM selalu hari ini)
    const startDate = moment().startOf("day").unix();
    const endDate = moment().endOf("day").unix();

    // Ambil semua pendaftaran hari ini
    const rawatJalanHariIni = await AdmisiClient.getAllRawatJalan({
      faskesUuid,
      startDate,
      endDate,
      token,
    });

    // Cek apakah pasien dengan no_identity + jadwal_dokter_uuid sudah ada
    const sudahTerdaftar = rawatJalanHariIni.some(
      (rj) =>
        rj.patient?.no_identity === patientData.no_identity &&
        rj.schedule?.uuid === body.jadwal_dokter_uuid
    );

    if (sudahTerdaftar) {
      throw new BadRequestException(
        "Pasien sudah terdaftar pada jadwal ini, tidak bisa mendaftar dua kali."
      );
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
      }

      const pendaftaran = await AdmisiClient.createRawatJalan(
        finalPayload,
        token
      );

      return pendaftaran;
    });
  }

  static async printAntrian({ kodeBooking, token }) {
    const bookingDetail = await AdmisiClient.printAntrian(
      {
        kode_booking: kodeBooking,
      },
      token
    );

    const payload = bookingDetail?.payload;

    const jadwalDokter = payload?.jadwal_dokter;
    if (!jadwalDokter) {
      throw new BadRequestException("Jadwal dokter tidak ditemukan.");
    }

    const now = moment();
    const todayDate = moment().format("YYYY-MM-DD");

    const endTime = moment(
      `${todayDate} ${jadwalDokter.end_time}`,
      "YYYY-MM-DD HH:mm:ss"
    );

    if (now.isAfter(endTime)) {
      throw new BadRequestException(
        `Jadwal dokter sudah kadaluarsa. Jam praktek dokter berakhir pukul ${jadwalDokter.end_time}.`
      );
    }

    const response = await AdmisiClient.printAntrian(
      {
        kode_booking: kodeBooking,
      },
      token
    );
    return response;
  }

  static async antrianFarmasi({ kodeBooking, token }) {
    const bookingDetail = await AdmisiClient.printAntrian(
      {
        kode_booking: kodeBooking,
      },
      token
    );

    return bookingDetail;
  }

  // FOR MOBILE

  static async registerPatientMobile({ faskesUuid, body, platform }) {
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;
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

      if (!checkResult) {
        throw new NotFoundException(
          `Pasien dengan No. RM ${body.patient_data.no_rm} tidak ditemukan.`
        );
      }
    }

    // const startDate = moment(tanggalPelayananString).startOf("day").unix();
    // const endDate = moment(tanggalPelayananString).endOf("day").unix();

    // const existingRegistrations = await AdmisiClient.getAllRawatJalanMobile({
    //   startDate,
    //   endDate,
    //   faskesUuid,
    //   admisiApiKey,
    // });

    // const alreadyRegistered = existingRegistrations.some(
    //   (reg) =>
    //     reg.patient?.no_identity === body.patient_data.no_identity &&
    //     reg.schedule?.uuid === body.jadwal_dokter_uuid
    // );

    // if (alreadyRegistered) {
    //   throw new BadRequestException(
    //     "Pasien sudah terdaftar pada jadwal dokter ini untuk tanggal tersebut."
    //   );
    // }

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
  static async checkInPatient({ kodeBooking, body, token }) {
    const bookingDetail = await AdmisiClient.printAntrian(
      {
        kode_booking: kodeBooking,
      },
      token
    );

    const payload = bookingDetail?.payload;
    if (!payload) {
      throw new BadRequestException("Data booking tidak ditemukan.");
    }

    if (payload?.tanggal_checkin) {
      throw new ConflictException(
        "Pasien sudah melakukan check-in sebelumnya."
      );
    }

    const jadwalDokter = payload?.jadwal_dokter;
    if (!jadwalDokter) {
      throw new BadRequestException("Jadwal dokter tidak ditemukan.");
    }

    const now = moment();
    const todayDate = moment().format("YYYY-MM-DD");

    const endTime = moment(
      `${todayDate} ${jadwalDokter.end_time}`,
      "YYYY-MM-DD HH:mm:ss"
    );

    if (now.isAfter(endTime)) {
      throw new BadRequestException(
        `Waktu check-in sudah kadaluarsa. Jam praktek dokter berakhir pukul ${jadwalDokter.end_time}.`
      );
    }

    const response = await AdmisiClient.checkInBooking(
      {
        kode_booking: kodeBooking,
      },
      token
    );
    return response;
  }
}
