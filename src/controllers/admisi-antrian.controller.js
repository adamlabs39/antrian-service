import AdmisiAntrianService from "../services/admisi-antrian.service.js";
import { FormatterService } from "../services/formatter.service.js";
import { TransactionService } from "../services/transaction.service.js";

export class AdmisiAntrianController {
  static async getAllAntrian(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const { pagination, data } = await AdmisiAntrianService.getAllAntrian({
        faskesUuid,
        filterBy: req.query,
      });

      res.status(200).json({
        message: "List antrian berhasil diambil",
        properties: pagination,
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllNoPagination(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const { data } = await AdmisiAntrianService.getAllNoPagination({
        faskesUuid,
        filterBy: req.query,
      });

      res.status(200).json({
        message: "List antrian berhasil diambil",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAntrianByUuid(req, res, next) {
    try {
      const { faskesUuid } = req.author;
      const { uuid } = req.params;
      const data = await AdmisiAntrianService.getAntrianByUuid(
        faskesUuid,
        uuid
      );
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
      
      // 2. Gunakan TransactionService.run
      const data = await TransactionService.run(async (transaction) => {
        return await AdmisiAntrianService.createAntrian({
          faskesUuid,
          requestData: req.body,
          transaction, // 3. Teruskan object transaction
        });
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
      const { uuid } = req.params;

      // 2. Gunakan TransactionService.run
      const data = await TransactionService.run(async (transaction) => {
        return await AdmisiAntrianService.updateAntrian({
          faskesUuid,
          requestData: req.body,
          uuid,
          transaction, // 3. Teruskan object transaction
        });
      });
      
      res.status(200).json({
        message: "Antrian berhasil diperbarui",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }

  //FOR MOBILE
  static async createAntrianMobile(req, res, next) {
    try {
      const faskesUuid = req.headers["faskes-uuid"];

      // 2. Gunakan TransactionService.run
      const data = await TransactionService.run(async (transaction) => {
        return await AdmisiAntrianService.createAntrianMobile({
          faskesUuid,
          requestData: req.body,
          transaction, // 3. Teruskan object transaction
        });
      });

      res.status(201).json({
        message: "Data antrian berhasil disimpan",
        payload: FormatterService.toSnakeCase(data),
      });
    } catch (error) {
      next(error);
    }
  }
}

