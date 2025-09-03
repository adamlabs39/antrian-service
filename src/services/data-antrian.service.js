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

      // Validasi format tanggal
      if (!moment(tanggalDariRequest, "YYYY-MM-DD", true).isValid()) {
        throw new BadRequestException(
          "Format tanggal_pelayanan tidak valid. Gunakan format YYYY-MM-DD."
        );
      }
      finalTanggalPelayanan = tanggalDariRequest;
    }

    let totalRegistrasiHariIni = 0;
    if (isPasienBaru) {
      // Hanya panggil jika pasien baru
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

    // === GENERATE NOMOR POLI ===
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

      if (report.kuotaTerpakai >= report.kuota) {
        throw new ConflictException(
          "Kuota antrian untuk jadwal ini sudah penuh."
        );
      }

      const noUrutPoli = report.kuotaTerpakai + 1;

      await report.update(
        {
          kuotaTerpakai: noUrutPoli,
          kuotaSisa: report.kuota - noUrutPoli,
        },
        { transaction }
      );

      noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
        jadwalHariIni.codeAntrianPoli,
        jadwalHariIni.codeAntrianDokter,
        noUrutPoli
      );
    }

    // === GENERATE NOMOR ADMISI (khusus pasien baru) ===
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
    const { patientUuid, rawatJalanUuid, jenisResep, jenisPasien, pasienBaru } =
      camelCaseBody;

    if (!jenisResep) {
      throw new BadRequestException(
        "jenis_resep wajib diisi untuk antrian farmasi."
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
        // kodeFarmasi: noAntrianFarmasi,
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

    if (report.kuotaTerpakai >= report.kuota) {
      throw new ConflictException(
        "Kuota antrian untuk jadwal ini sudah penuh."
      );
    }

    const noUrutPoli = report.kuotaTerpakai + 1;

    await report.update({
      kuotaTerpakai: noUrutPoli,
      kuotaSisa: report.kuota - noUrutPoli,
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
