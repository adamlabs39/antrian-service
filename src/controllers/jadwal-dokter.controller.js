import { FormatterService } from "../services/formatter.service.js";
import { JadwalDokterService } from "../services/jadwal-dokter.service.js";

export class JadwalDokterController {
  /**
   * gets all the schedules available grouped by the doctor and location.
   *
   * @param {*} req
   * req must have author object with faskesUuid, if it is not there,
   * then you forgot to put the auth middleware
   *
   * @param {*} res
   * @param {*} next
   */
  static async findAll(req, res, next) {
    try {
      const { faskesUuid } = req.author;

      // We are calling the findAll method from JadwalDokterService
      // and passing the faskesUuid and filterBy from req.query
      // to get the data and pagination properties
      const { pagination, data } = await JadwalDokterService.findAll({
        faskesUuid,
        filterBy: req.query,
      });

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        properties: FormatterService.toSnakeCase(pagination),
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async findAllByDoctorAndLocation(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await JadwalDokterService.findAllByDoctorAndLocation({
        faskesUuid,
        params: req.params,
      });

      res.status(200).json({
        message: "Data berhasil ditampilkan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { faskesUuid } = req.author;
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
}
