import { compareSync } from "bcrypt";
// import { PatientRepository } from "../repositories/patient.repository.js";
// import { APMSchema } from "../validations/apm.validation.js";
// import ZodValidator from "../validations/zod.validation.js";
// import { NotFoundException } from "../exceptions/not-found.exception.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
// import { AntrianRepository } from "../repositories/antrian.repository.js";
import { DataAntrianService } from "./data-antrian.service.js";
import { AdmisiClient } from "../clients/admisi.client.js";
// import { DataMasterClient } from "../clients/datamaster.client.js";

export class APMService {
  static async checkPatientStatus({body, token }) {
    return await AdmisiClient.checkPatient(body, token);
  }

  static async registerPatient({ faskesUuid, body, token }) {
    const pendaftaran = await AdmisiClient.createRawatJalan(body, token);

    // const pendaftaranLengkap = await DataAntrianService.processRegistration({
    //   faskesUuid,
    //   body: { rawat_jalan_uuid: pendaftaran.uuid },
    //   token,
    // });

    // const pendaftaranLengkap = await AdmisiClient.getRawatJalanDetail(
    //   pendaftaran.uuid,
    //   token
    // );

    return pendaftaran;
  }

  static async checkIn({ faskesUuid, body, token }) {
    const { kode_booking } = body;

    // 1. Memicu check-in di layanan Admisi
    const pendaftaran = await AdmisiClient.checkInByBookingCode(kode_booking, token);

    // 2. Memicu proses pembuatan nomor antrian
    await DataAntrianService.processRegistration({
        faskesUuid,
        body: { rawat_jalan_uuid: pendaftaran.uuid },
        token
    });

    // 3. Ambil kembali data yang sudah lengkap dengan nomor antrian
    const pendaftaranLengkap = await AdmisiClient.getRawatJalanDetail(pendaftaran.uuid, token);

    return pendaftaranLengkap;
  }


  /**
   * Mengambil detail booking dari layanan Admisi untuk di-print.
   */
  static async getBookingDetail({ faskesUuid, params, token }) {
    const { kode_booking } = params;
    // Meneruskan permintaan pencarian booking ke layanan Admisi
    return await AdmisiClient.findRawatJalanByBookingCode(kode_booking, token);
  }

  static async getAvailableSchedule({ faskesUuid, params, token }) {
    const { poli_uuid: poliUuid } = params;

    // 1. Ambil semua jadwal aktif hari ini dari database lokal
    const jadwalDokterHariIni =
      await JadwalDokterRepository.findAllByLocationToday({
        faskesUuid,
        poliUuid,
      });

    if (jadwalDokterHariIni.length === 0) {
      return [];
    }

    // 2. Ambil semua data pendaftaran hari ini dari layanan Admisi
    const pendaftaranHariIni = await AdmisiClient.getRawatJalanToday(
      faskesUuid,
      token
    );

    // 3. Hitung sisa kuota untuk setiap jadwal
    const jadwalDenganSisaKuota = jadwalDokterHariIni.map((jadwal) => {
      // Hitung berapa banyak pendaftaran yang sudah menggunakan jadwal ini
      const pendaftarSaatIni = pendaftaranHariIni.filter(
        (rj) => rj.schedule && rj.schedule.uuid === jadwal.uuid
      ).length;

      // Hitung sisa kuota
      const sisaKuota = jadwal.kuota - pendaftarSaatIni;

      return {
        ...jadwal,
        sisa_kuota: sisaKuota > 0 ? sisaKuota : 0, // Pastikan tidak negatif
      };
    });

    return jadwalDenganSisaKuota;
  }

  // static async getAvailablePoliklinik({ faskesUuid, token }) {
  //   const poliklinik = await DataMasterClient.getAktifPoli(token);

  //   return poliklinik;
  // }
}
