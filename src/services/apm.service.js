import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import moment from "moment";
import { TransactionService } from "./transaction.service.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { ReportAntrianService } from "./report-antrian.service.js";

export class APMService {
  static async registerPatient({ faskesUuid, body, token, platform }) {
    const patientData = body.patient_data;

    if (!patientData) {
      throw new BadRequestException("Data pasien (patient_data) wajib diisi.");
    }

    if (!patientData.identity) {
      throw new BadRequestException("Jenis identitas wajib diisi.");
    }

    if (!patientData.no_identity) {
      throw new BadRequestException("Nomor identitas wajib diisi.");
    }

    const startDate = moment().startOf("day").unix();
    const endDate = moment().endOf("day").unix();
    const tanggalKunjugan = moment().unix();

    const rawatJalanHariIni = await AdmisiClient.getAllRawatJalan({
      faskesUuid,
      startDate,
      endDate,
      token,
    });

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
      identity: body.patient_data?.identity,
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
        jadwal_periksa: tanggalKunjugan,
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

    const payload = bookingDetail?.payload;

    if (!payload) {
      throw new BadRequestException("Data booking tidak ditemukan.");
    }

    const antrianFarmasi = payload?.no_antrian_farmasi;
    if (!antrianFarmasi) {
      throw new BadRequestException("nomor antrian farmasi tidak ditemukan");
    }

    const tanggalHariIni = moment().startOf("day");

    const tanggalPeriksa = moment.unix(payload.jadwal_periksa).startOf("day");

    if (!tanggalHariIni.isSame(tanggalPeriksa, "day")) {
      throw new BadRequestException("Kode booking sudah kadaluarsa.");
    }

    return bookingDetail;
  }

  // FOR MOBILE

  static async registerPatientMobile({ faskesUuid, body, platform }) {
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;
    if (!admisiApiKey) {
      throw new Error("API Key untuk layanan Admisi tidak ditemukan.");
    }

    const tanggalPelayananString = moment(body.jadwal_periksa).format("YYYY-MM-DD");

    if (!moment(tanggalPelayananString, "YYYY-MM-DD", true).isValid()) {
      throw new BadRequestException(
        "Format tanggal tidak valid. Gunakan format YYYY-MM-DD."
      );
    }

    const no_rm = body.patient_data?.no_rm;
    const isPasienBaru = no_rm == null || no_rm === "null";
    let checkResult = null;

    if (!isPasienBaru) {
      checkResult = await AdmisiClient.checkPatientMobile(
        {
          faskes_uuid: faskesUuid,
          identity: body.patient_data?.identity,
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
        jadwal_periksa: moment(tanggalPelayananString, "YYYY-MM-DD").unix(),
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

  static async updatePatientMobile({
    faskesUuid,
    appointmentUuid,
    body,
    platform,
  }) {
    const admisiApiKey = process.env.ADMISI_SECRET_KEY;
    if (!admisiApiKey) {
      throw new Error("API Key untuk layanan Admisi tidak ditemukan.");
    }

    const newJadwalDokterUuid = body.jadwal_dokter_uuid;
    const newTanggalPeriksa =
      body.tanggal_periksa || moment().format("YYYY-MM-DD");

    return TransactionService.run(async (transaction) => {
      await ReportAntrianService.cancelBooking({
        jadwalDokterUuid: bookingLama.jadwal_dokter_uuid,
        tanggalPelayanan: moment
          .unix(bookingLama.jadwal_periksa)
          .format("YYYY-MM-DD"),
        transaction,
      });

      const generatedCodes = await DataAntrianService.processRegistration({
        faskesUuid,
        requestData: body,
        isPasienBaru: false,
        platform,
        token: admisiApiKey,
        tanggalPelayanan: newTanggalPeriksa,
        transaction,
      });

      const finalPayload = {
        ...generatedCodes,
        jadwal_dokter_uuid: newJadwalDokterUuid,
        jadwal_periksa: moment(newTanggalPeriksa, "YYYY-MM-DD").unix(),
      };

      const pendaftaranTerupdate = await AdmisiClient.updateRawatJalanMobile(
        appointmentUuid,
        finalPayload,
        faskesUuid,
        admisiApiKey
      );

      return pendaftaranTerupdate;
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

    const jadwalPeriksaUnix = payload?.jadwal_periksa;
    if (!jadwalPeriksaUnix) {
      throw new BadRequestException(
        "Tanggal jadwal periksa tidak ditemukan pada data booking."
      );
    }

    const tanggalJadwalPeriksa = moment.unix(jadwalPeriksaUnix);

    const tanggalHariIni = moment();
    if (!tanggalJadwalPeriksa.isSame(tanggalHariIni, "day")) {
      throw new BadRequestException(
        `Waktu check-in tidak sesuai dengan jadwal periksa (${tanggalJadwalPeriksa.format(
          "DD MMMM YYYY"
        )})`
      );
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
