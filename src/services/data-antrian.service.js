import { CodeGenerator } from "../helpers/code-generator.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js"; // 1. Impor repository jadwal
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { uuidv7 } from "uuidv7";

export class DataAntrianService {


  static async processRegistration({ faskesUuid, body, token }) {
    const { rawat_jalan_uuid } = body;
    if (!rawat_jalan_uuid) {
      throw new BadRequestException("rawat_jalan_uuid wajib diisi.");
    }

    const pendaftaran = await AdmisiClient.getRawatJalanDetail(
      rawat_jalan_uuid,
      token
    );

    if (!pendaftaran) {
      throw new NotFoundException(
        "Data pendaftaran tidak ditemukan di layanan Admisi."
      );
    }

    let jadwalHariIni;

    if (!pendaftaran.practitioner_uuid || !pendaftaran.lokasi_uuid) {
      throw new BadRequestException(
        "Data pendaftaran tidak lengkap, dokter atau poliklinik belum ditentukan."
      );
    }
    // if (!pendaftaran.practitioner || !pendaftaran.polyclinic) {
    //   throw new BadRequestException(
    //     "Data pendaftaran tidak lengkap, dokter atau poliklinik belum ditentukan."
    //   );
    // }

    const rawatJalanToday = await AdmisiClient.getRawatJalanToday(
      faskesUuid,
      token
    );

    // Cek kuota jika ini adalah pendaftaran ke poli
    if (pendaftaran.jadwal_dokter_uuid) {
       jadwalHariIni =
        await JadwalDokterRepository.findTodayScheduleByDoctorAndLocation({
          faskesUuid,
          dokterUuid: pendaftaran.practitioner_uuid,
          poliUuid: pendaftaran.lokasi_uuid,
        });

      if (!jadwalHariIni) {
        throw new NotFoundException(
          "Tidak ada jadwal aktif untuk dokter di poliklinik ini hari ini."
        );
      }

      const antrianSaatIni = rawatJalanToday.filter(
        (rj) => rj.jadwal_dokter_uuid === jadwalHariIni.uuid
      ).length;

      if (antrianSaatIni >= jadwalHariIni.kuota) {
        throw new ConflictException(
          "Kuota antrian untuk jadwal ini sudah penuh."
        );
      }
    }

    // Hitung dan generate semua nomor yang dibutuhkan
    const noUrutAdmisi =
      rawatJalanToday.filter((rj) => rj.no_antrian_admisi).length + 1;
    const noUrutPoli =
      rawatJalanToday.filter(
        (rj) =>
          rj.no_antrian_poli &&
          rj.polyclinic.uuid === pendaftaran.lokasi_uuid
      ).length + 1;

    const noAntrianAdmisi = CodeGenerator.generateNoAntrianAdmisi(noUrutAdmisi);
    const noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
      jadwalHariIni.codeAntrianPoli,
      jadwalHariIni.codeAntrianDokter,
      noUrutPoli
    );
    const kodeBooking = CodeGenerator.generateKodeBooking();

    const paymentMethodMap = {
      1: "TUNAI",
      2: "ASURANSI",
    };

    const generatedCodes = {
      no_antrian_admisi: noAntrianAdmisi,
      no_antrian_poli: noAntrianPoli,
      kode_booking: kodeBooking,
      patient_data: pendaftaran.patient,
      payment_method: paymentMethodMap[pendaftaran.payment_method],
      jadwal_dokter_uuid: pendaftaran.jadwal_dokter_uuid,
      complaint: pendaftaran.complaint,
      note: pendaftaran.note,
    };

    // Update data di layanan Admisi dengan nomor yang baru
    await AdmisiClient.updateRawatJalan(
      rawat_jalan_uuid,
      generatedCodes,
      token
    );

    // 6. Simpan catatan antrian ke database lokal untuk monitoring
    // await AntrianRepository.create({
    //   uuid: uuidv7(),
    //   faskesUuid,
    //   rawatJalanUuid: rawat_jalan_uuid,
    //   patientUuid: pendaftaran.patient_uuid,
    //   jadwalDokterUuid: pendaftaran.jadwal_dokter_uuid,
    //   pelayanan: "poli", // Atau "admisi", tergantung dari tipe pendaftaran
    //   statusPanggilan: 1, // Status awal: Menunggu
    // });

    return generatedCodes;
  }
}
