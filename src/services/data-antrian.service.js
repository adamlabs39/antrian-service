import { CodeGenerator } from "../helpers/code-generator.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js"; // 1. Impor repository jadwal
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

export class DataAntrianService {
  static async processRegistration({ faskesUuid, body, token }) {
    const { rawat_jalan_uuid } = body;
    if (!rawat_jalan_uuid) {
      throw new BadRequestException("rawat_jalan_uuid wajib diisi.");
    }

    // 1. Ambil semua data yang dibutuhkan secara bersamaan untuk efisiensi
    const [pendaftaran, rawatJalanToday] = await Promise.all([
      AdmisiClient.getRawatJalanDetail(rawat_jalan_uuid, token),
      AdmisiClient.getRawatJalanToday(faskesUuid, token),
    ]);

    console.log("Pendaftaran:", pendaftaran);
    console.log("Rawat Jalan Hari Ini:", rawatJalanToday);

    if (!pendaftaran) {
      throw new NotFoundException(
        "Data pendaftaran tidak ditemukan di layanan Admisi."
      );
    }
    if (!pendaftaran.practitioner_uuid || !pendaftaran.lokasi_uuid) {
      throw new BadRequestException(
        "Data pendaftaran tidak lengkap, dokter atau poliklinik belum ditentukan."
      );
    }

    // 2. Deklarasikan variabel di sini agar bisa diakses di seluruh fungsi
    let jadwalHariIni;
    let noUrutPoli = null;
    let noAntrianPoli = null;

    // Cek jadwal pendaftaran ke poli
    if (pendaftaran.jadwal_dokter_uuid) {
      jadwalHariIni = await JadwalDokterRepository.findScheduleByUuid(
        pendaftaran.jadwal_dokter_uuid
      );

      console.log("Jadwal Hari Ini:", jadwalHariIni);

      if (!jadwalHariIni) {
        throw new NotFoundException(
          "Tidak ada jadwal aktif untuk dokter di poliklinik ini hari ini."
        );
      }

      const antrianSaatIni = rawatJalanToday.filter(
        (rj) => rj.schedule && rj.schedule.uuid === jadwalHariIni.uuid
      ).length;

      console.log("Antrian Saat Ini:", antrianSaatIni);

      // Cek kuota
      if (antrianSaatIni >= jadwalHariIni.kuota) {
        throw new ConflictException(
          "Kuota antrian untuk jadwal ini sudah penuh."
        );
      }

      noUrutPoli = antrianSaatIni + 1;

      // Generate nomor antrian poli di sini
      noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
        jadwalHariIni.codeAntrianPoli,
        jadwalHariIni.codeAntrianDokter,
        noUrutPoli
      );
    }

    // Hitung dan generate semua nomor yang

    const noUrutAdmisi =
      rawatJalanToday.filter((rj) => rj.no_antrian_admisi).length + 1;
    const noAntrianAdmisi = CodeGenerator.generateNoAntrianAdmisi(noUrutAdmisi);
    const kodeBooking = CodeGenerator.generateKodeBooking();

    console.log("Nomor Antrian Poli:", noAntrianPoli);
    console.log("Nomor Antrian Admisi:", noAntrianAdmisi);

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
