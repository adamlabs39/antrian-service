import { CodeGenerator } from "../helpers/code-generator.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import moment from "moment";
import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";
import { getDay } from "../helpers/get-day.helper.js";
import { FormatterService } from "./formatter.service.js";
import AdmisiAntrianRepository from "../repositories/admisi-antrian.repository.js";

export class DataAntrianService {
  static async processRegistration({
    faskesUuid,
    requestData,
    isPasienBaru,
    platform,
    token,
    tanggalPelayanan: tanggalDariService,
    transaction,
  }) {
    let finalTanggalPelayanan;
    if (platform === "APM") {
      finalTanggalPelayanan = moment().format("YYYY-MM-DD");
    } else {
      const tanggalDariRequest =
        tanggalDariService ||
        requestData.tanggal_periksa ||
        moment().format("YYYY-MM-DD");

      if (!moment(tanggalDariRequest, "YYYY-MM-DD", true).isValid()) {
        throw new BadRequestException(
          "Format tanggal_pelayanan tidak valid. Gunakan format YYYY-MM-DD."
        );
      }
      finalTanggalPelayanan = tanggalDariRequest;
    }

    let totalRegistrasiHariIni = 0;
    if (isPasienBaru) {
      if (platform === "MOBILE") {
        totalRegistrasiHariIni =
          await AdmisiClient.getTodayRegistrationCountMobile(faskesUuid, token);
      } else {
        totalRegistrasiHariIni = await AdmisiClient.getTodayRegistrationCount(
          token
        );
      }
    }

    let noAntrianAdmisi = null;
    let noAntrianPoli = null;

    // GENERATE NOMOR ANTRIAN POLI
    if (requestData.jadwal_dokter_uuid) {
      const jadwalHariIni = await JadwalDokterRepository.findJadwalByUuid(
        requestData.jadwal_dokter_uuid,
        { transaction }
      );

      if (!jadwalHariIni) {
        throw new NotFoundException(
          "Tidak ada jadwal aktif untuk dokter ini hari ini."
        );
      }

      const namaHariPilihan = getDay(finalTanggalPelayanan);
      const namaHariJadwal = jadwalHariIni.day;

      if (namaHariPilihan !== namaHariJadwal) {
        throw new BadRequestException(
          `Jadwal dokter tidak tersedia pada hari ${namaHariPilihan}. Jadwal yang tersedia adalah hari ${namaHariJadwal}.`
        );
      }

      const report = await ReportAntrianRepository.findOrCreateReport(
        {
          jadwalDokter: jadwalHariIni,
          tanggalPelayanan: finalTanggalPelayanan,
        },
        { transaction }
      );

      if (report.jumlahAntrianAktif >= report.kuota) {
        throw new ConflictException(
          "Kuota antrian untuk jadwal ini sudah penuh."
        );
      }

      // 2. Nomor urut baru diambil dari nomor antrian terakhir
      const noUrutPoli = report.noAntrianTerakhir + 1;

      // 3. Update report dengan kolom baru
      await report.update(
        {
          noAntrianTerakhir: noUrutPoli,
          jumlahAntrianAktif: report.jumlahAntrianAktif + 1,
        },
        { transaction }
      );

      noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
        jadwalHariIni.codeAntrianPoli,
        jadwalHariIni.codeAntrianDokter,
        noUrutPoli
      );
    }

    //  GENERATE NOMOR ANTRIAN ADMISI (khusus pasien baru) ===
    if (isPasienBaru) {
      const noUrutAdmisi = totalRegistrasiHariIni + 1;
      noAntrianAdmisi = CodeGenerator.generateNoAntrianAdmisi(noUrutAdmisi);
    }

    const kodeBooking = CodeGenerator.generateKodeBooking();

    const generatedCodes = {
      no_antrian_poli: noAntrianPoli,
      kode_booking: kodeBooking,
      platform: platform,
    };

    if (isPasienBaru) {
      generatedCodes.no_antrian_admisi = noAntrianAdmisi;
    }

    return generatedCodes;
  }

  static async processAntrianFarmasi({ faskesUuid, body, token, transaction }) {
    const camelCaseBody = FormatterService.toCamelCase(body);
    const {
      patientUuid,
      rawatJalanUuid,
      jenisResep,
      jenisPasien,
      pasienBaru,
      kodeBooking,
    } = camelCaseBody;

    const bookingDetail = await AdmisiClient.printAntrian(
      { kode_booking: kodeBooking },
      token
    );
    const bookingPayload = bookingDetail.payload;
    console.log(bookingPayload);

    if (bookingPayload.no_antrian_farmasi !== null) {
      throw new ConflictException(
        "Pasien sudah memiliki nomor antrian farmasi."
      );
    }
    if (
      !bookingPayload.patient ||
      bookingPayload.patient.uuid !== patientUuid
    ) {
      console.log("patient uuid:", bookingPayload.patient.uuid);
      console.log("patientUuid:", patientUuid);
      throw new BadRequestException(
        "Patient UUID yang dikirim tidak cocok dengan data dari kode booking."
      );
    }

    if (bookingPayload.uuid !== rawatJalanUuid) {
      throw new BadRequestException(
        "rawat Jalan Uuid yang dikirim tidak cocok dengan data dari kode booking."
      );
    }

    if (!patientUuid) {
      throw new BadRequestException(
        "patient_uuid wajib diisi untuk antrian farmasi."
      );
    }

    if (!rawatJalanUuid) {
      throw new BadRequestException(
        "rawat_jalan_uuid wajib diisi untuk antrian farmasi."
      );
    }

    if (!jenisResep) {
      throw new BadRequestException(
        "jenis_resep wajib diisi untuk antrian farmasi."
      );
    }

    if (!jenisPasien) {
      throw new BadRequestException(
        "jenis_pasien wajib diisi untuk antrian farmasi."
      );
    }

    if (!pasienBaru) {
      throw new BadRequestException(
        "pasien_baru wajib diisi untuk antrian farmasi."
      );
    }

    const totalFarmasiHariIni = await AntrianRepository.countTodayByPelayanan({
      faskesUuid,
      pelayanan: "farmasi",
      jenisResep,
      transaction,
    });

    const nomorUrut = totalFarmasiHariIni + 1;
    const noAntrianFarmasi = CodeGenerator.generateNoAntrianFarmasi(
      jenisResep,
      nomorUrut
    );

    await AdmisiAntrianRepository.create(
      {
        faskesUuid,
        patientUuid,
        rawatJalanUuid,
        pelayanan: "farmasi",
        jenisPasien,
        pasienBaru,
        jenisResep,
      },
      { transaction }
    );

    const dataToUpdate = {
      no_antrian_farmasi: noAntrianFarmasi,
    };

    await AdmisiClient.updateAntrianFarmasi(
      rawatJalanUuid,
      dataToUpdate,
      token
    );

    return { no_antrian_farmasi: noAntrianFarmasi };
  }

  // khusus untuk platform ADMISI
  static async processAdmisiRegistration({ faskesUuid, requestData, token }) {
    const { jadwal_dokter_uuid } = requestData;
    if (!jadwal_dokter_uuid) {
      throw new NotFoundException("jadwal dokter tidak ditemukan.");
    }

    const jadwalDokter = await JadwalDokterRepository.findJadwalByUuid(
      jadwal_dokter_uuid
    );

    if (!jadwalDokter) {
      throw new NotFoundException("Jadwal dokter terkait tidak ditemukan.");
    }

    const tanggalPelayanan = moment().format("YYYY-MM-DD");

    const report = await ReportAntrianRepository.findOrCreateReport({
      jadwalDokter: jadwalDokter,
      tanggalPelayanan,
    });

    // 1. Validasi kuota berdasarkan jumlah antrian aktif
    if (report.jumlahAntrianAktif >= report.kuota) {
      throw new ConflictException(
        "Kuota antrian untuk jadwal ini sudah penuh."
      );
    }

    // 2. Nomor urut baru diambil dari nomor antrian terakhir
    const noUrutPoli = report.noAntrianTerakhir + 1;

    // 3. Update report dengan kolom baru
    await report.update({
      noAntrianTerakhir: noUrutPoli,
      jumlahAntrianAktif: report.jumlahAntrianAktif + 1,
    });

    const noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
      jadwalDokter.codeAntrianPoli,
      jadwalDokter.codeAntrianDokter,
      noUrutPoli
    );
    const kodeBooking = CodeGenerator.generateKodeBooking();

    return {
      no_antrian_poli: noAntrianPoli,
      kode_booking: kodeBooking,
      tanggal_pelayanan: tanggalPelayanan,
    };
  }
}
