import AdmisiAntrianService from "../services/admisi-antrian.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class AdmisiAntrianController {

    static async getAntrianByUuid(req, res, next) {
        try {
            const { faskesUuid } = req.author;
            const { uuid } = req.params;
            const data = await AdmisiAntrianService.getAntrianByUuid(faskesUuid, uuid);
            res.status(200).json({
                message: "Detail antrian berhasil diambil",
                payload: data,
            });
        } catch (error) {
            next(error);
        }
    }

  static async createAntrian(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const data = await AdmisiAntrianService.createAntrian({
        faskesUuid,
        requestData: req.body,
      });
      res.status(201).json({
        message: "Data antrian berhasil disimpan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAntrian(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      console.log("faskesUuid controller", faskesUuid);
      const { uuid } = req.params;
      console.log("uuid", uuid);
      const data = await AdmisiAntrianService.updateAntrian({
        faskesUuid,
        requestData: req.body,
        uuid,
      });
      res.status(200).json({
        message: "Antrian berhasil diperbarui",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }
}
