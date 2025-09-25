import { FormatterService } from "../services/formatter.service.js";
import { JadwalDokterService } from "../services/jadwal-dokter.service.js";
import { generateSuccessMessage } from "../helpers/generate-message.js";

export class JadwalDokterController {
  static async findAll(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      const { pagination, data } = await JadwalDokterService.findAll({
        faskesUuid,
        filterBy: req.query,
      });

      res
        .status(200)
        .json(
          generateSuccessMessage("Data berhasil ditampilkan", data, pagination)
        );
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res) {
    try {
      const faskesUuid = req.author.faskesUuid;
      const filters = req.query;

      const data =
        await JadwalDokterService.getAllJadwalDokterWithoutPagination({
          faskesUuid,
          filters,
        });

      res.status(200).json({
        message: "Successfully fetched all doctor schedules",
        data: data,
      });
    } catch (error) {
      console.error("Error in JadwalDokterController.getAll:", error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async findAllByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await JadwalDokterService.findAllByDoctorAndLocation({
        faskesUuid,
        params: req.params,
      });

      res
        .status(200)
        .json(generateSuccessMessage("Data berhasil ditampilkan", data));
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      console.log("faskesUuid", faskesUuid);
      const data = await JadwalDokterService.create({
        faskesUuid,
        jadwalDokter: req.body,
      });
      res.status(201).json({
        message: "Data berhasil ditambahkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      await JadwalDokterService.updateByDoctorAndLocation({
        faskesUuid,
        params: req.params,
        body: req.body,
      });

      res.status(200).json({
        message: "Data berhasil diupdate",
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      await JadwalDokterService.deleteAllByDoctorAndLocation({
        faskesUuid,
        params: req.params,
      });

      res.status(200).json({
        message: "Data berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  }

  // FOR MOBILE

  static async findAllWithAPIKey(req, res, next) {
    try {
      const faskesUuid = req.headers["faskes-uuid"];

      const { pagination, data } = await JadwalDokterService.findAll({
        faskesUuid: faskesUuid,
        filterBy: req.query,
      });

      res
        .status(200)
        .json(
          generateSuccessMessage("Data berhasil ditampilkan", data, pagination)
        );
    } catch (error) {
      next(error);
    }
  }

  static async getAllWithoutpagination(req, res, next) {
    try {
      const faskesUuid = req.headers["faskes-uuid"];

      const data =
        await JadwalDokterService.getAllJadwalDokterWithoutPagination({
          faskesUuid,
          filters: req.query,
        });

      res
        .status(200)
        .json(generateSuccessMessage("Data berhasil ditampilkan", data));
    } catch (err) {
      next(err);
    }
  }

  static async getAvailableKuota(req, res, next) {
    try {
      const faskesUuid = req.headers["faskes-uuid"];
      const { dokter_uuid, poli_uuid, tanggal_pelayanan } = req.query;
      const data = await JadwalDokterService.getAvailableKuota({
        faskesUuid,
        dokterUuid: dokter_uuid,
        poliUuid: poli_uuid,
        tanggalPelayanan: tanggal_pelayanan,
      });

      res.status(200).json({
        message: "Sisa kuota berhasil ditampilkan",
        payload: data,
      });
    } catch (err) {
      next(err);
    }
  }
}
