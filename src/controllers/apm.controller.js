import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { APMService } from "../services/apm.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class APMController {
  static async registerPatient(req, res, next) {
    try {
      const platform = "APM";
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      // Meneruskan semua data pendaftaran ke service
      const result = await APMService.registerPatient({
        faskesUuid,
        body: req.body,
        token,
        platform,
      });

      res.status(201).json(result); 
    } catch (err) {
      next(err);
    }
  }

  static async printAntrian(req, res, next) {
    try {
      const { kode_booking } = req.body;
      const token = req.headers.authorization;

      if (!kode_booking) {
        throw new BadRequestException("Kode booking wajib diisi.");
      }

      const result = await APMService.printAntrian({
        kodeBooking: kode_booking,
        token,
      });

      res.status(200).json({
        message: "Print berhasil.",
        payload: result.payload,
      });
    } catch (err) {
      next(err);
    }
  }

  // FOR MOBILE

  //registrasi melalui mobile
  static async registerPatientMobile(req, res, next) {
    try {
      const platform = "MOBILE";
      const faskesUuid = req.headers["faskes-uuid"];

      const result = await APMService.registerPatientMobile({
        faskesUuid,
        body: req.body,
        platform,
      });

      res.status(201).json(result); // Kirim kembali respons dari service
    } catch (err) {
      next(err);
    }
  }

  //fungsi untuk checkin mobile
  static async checkInPatient(req, res, next) {
    try {
      const { kode_booking } = req.body;
      const token = req.headers.authorization;

      if (!kode_booking) {
        throw new BadRequestException("Kode booking wajib diisi.");
      }

      const result = await APMService.checkInPatient({
        kodeBooking: kode_booking,
        body: req.body,
        token,
      });

      res.status(200).json({
        message: "Check-in berhasil.",
        payload: result.payload,
      });
    } catch (err) {
      next(err);
    }
  }

  static async antrianFarmasi(req, res, next){
    try{
      const { kode_booking } = req.body;
      const token = req.headers.authorization;

      if (!kode_booking) {
        throw new BadRequestException("Kode booking wajib diisi.");
      }

      const result = await APMService.antrianFarmasi({
        kodeBooking: kode_booking,
        token,
      });

      res.status(200).json({
        message: "Konfirmasi Obat Berhasil",
        payload: result.payload,
      });
    } catch (err) {
      throw new BadRequestException("Terjadi kesalahan saat memproses antrian farmasi.");
    }
  }
}
