import { CodeGenerator } from "../helpers/code-generator.js";
import { AdmisiClient } from "../clients/admisi.client.js";
import { JadwalDokterRepository } from "../repositories/jadwal-dokter.repository.js";
import { AntrianRepository } from "../repositories/antrian.repository.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import moment from "moment";
import { ReportAntrianRepository } from "../repositories/report-antrian.repository.js";

export class DataAntrianService {
  static async processRegistration({ faskesUuid, requestData, isPasienBaru, token }) {
  // Ambil semua rawat jalan hari ini untuk hitung admisi
  const rawatJalanToday = await AdmisiClient.getRawatJalanToday(faskesUuid, token);
  console.log("is pasien baru (DATA ANTRIAN)", isPasienBaru);
  let noAntrianAdmisi = null;
  let noAntrianPoli = null;

  // === GENERATE NOMOR POLI ===
  if (requestData.jadwal_dokter_uuid) {
    const jadwalHariIni = await JadwalDokterRepository.findJadwalByUuid(
      requestData.jadwal_dokter_uuid
    );

    if (!jadwalHariIni) {
      throw new NotFoundException("Tidak ada jadwal aktif untuk dokter ini hari ini.");
    }

    const tanggalPelayanan = moment().format("YYYY-MM-DD");
    const report = await ReportAntrianRepository.findOrCreateReport({
      jadwalDokter: jadwalHariIni,
      tanggalPelayanan,
    });

    if (report.kuotaTerpakai >= report.kuota) {
      throw new ConflictException("Kuota antrian untuk jadwal ini sudah penuh.");
    }

    await report.update({
      kuotaTerpakai: report.kuotaTerpakai + 1,
      kuotaSisa: report.kuota - (report.kuotaTerpakai + 1),
    });

    const noUrutPoli = report.kuotaTerpakai + 1;
    noAntrianPoli = CodeGenerator.generateNoAntrianPoli(
      jadwalHariIni.codeAntrianPoli,
      jadwalHariIni.codeAntrianDokter,
      noUrutPoli
    );
  }

  // === GENERATE NOMOR ADMISI (khusus pasien baru) ===
  if (isPasienBaru) {
    console.log("is pasien baru (DI IF)", isPasienBaru);
    const noUrutAdmisi = rawatJalanToday.filter(rj => rj.no_antrian_admisi).length + 1;
    noAntrianAdmisi = CodeGenerator.generateNoAntrianAdmisi(noUrutAdmisi);
  }

  const kodeBooking = CodeGenerator.generateKodeBooking();

  const generatedCodes = {
    no_antrian_poli: noAntrianPoli,
    kode_booking: kodeBooking,
    platform: "APM",
  };

  if (isPasienBaru) {
    generatedCodes.no_antrian_admisi = noAntrianAdmisi;
  }

  return generatedCodes;
}
}
