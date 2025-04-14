import { NotFoundException } from "../exceptions/not-found.exception.js";
import { LayarAntrianRepository } from "../repositories/layar-antrian.repository.js";
import { PoliklinikRepository } from "../repositories/poliklinik.repository.js";
import { LayarAntrianSchema } from "../validations/layar-antrian.validation.js";
import ZodValidator from "../validations/zod.validation.js";
import { FormatterService } from "./formatter.service.js";
import { LayarAntrianPoliRepository } from "../repositories/layar-antrian-poli.repository.js";
import { TransactionService } from "./transaction.service.js";

export class LayarAntrianService {
  static async findAll({ faskesUuid, filterBy: filterQuery }) {
    const queries = ZodValidator.validate(
      LayarAntrianSchema.FILTER_QUERY,
      filterQuery
    );

    let { page, page_size: pageSize, ...filters } = queries;
    if (page === undefined) page = 1;
    if (pageSize === undefined) pageSize = 10;

    const { pagination, data } = await LayarAntrianRepository.findAll({
      faskesUuid,
      filters,
      page,
      pageSize,
    });

    if (data.length === 0) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return { pagination, data };
  }

  static async findOne({ faskesUuid, params }) {
    const { layar_antrian_uuid: uuid } = ZodValidator.validate(
      LayarAntrianSchema.LAYAR_ANTRIAN_PARAM,
      params
    );

    const data = await LayarAntrianRepository.findOne({
      faskesUuid,
      uuid,
    });

    if (!data) {
      throw new NotFoundException("Data tidak ditemukan");
    }

    return data;
  }

  static async create({ faskesUuid, layarAntrian }) {
    await TransactionService.run(async (tx) => {
      const validated = ZodValidator.validate(
        LayarAntrianSchema.CREATE,
        layarAntrian
      );

      const expectedPayload = FormatterService.toCamelCase(validated);

      const created = await LayarAntrianRepository.create({
        faskesUuid,
        layarAntrian: expectedPayload,
        transaction: tx,
      });

      const existingPolikliniks =
        await PoliklinikRepository.findAllByPoliklinikUUIDs({
          faskesUuid,
          poliklinikUuids: validated.poli_uuids,
        });

      if (existingPolikliniks.length !== validated.poli_uuids.length) {
        throw new NotFoundException(
          "Terdapat poliklinik yang tidak ditemukan. Request dibatalkan."
        );
      }

      if (validated.is_poli) {
        await LayarAntrianPoliRepository.bulkCreate({
          faskesUuid,
          layarAntrianUuid: created.uuid,
          poliklinikUuids: validated.poli_uuids,
          transaction: tx,
        });
      }
    });
  }

  static async update({ faskesUuid, params, layarAntrian }) {
    await TransactionService.run(async (tx) => {
      ZodValidator.validate(LayarAntrianSchema.UPDATE, layarAntrian);
      console.log(params)
      const { layar_antrian_uuid } = ZodValidator.validate(
        LayarAntrianSchema.LAYAR_ANTRIAN_PARAM,
        params
      );
    

      const existingLayarAntrian = await LayarAntrianRepository.findOne({
        faskesUuid,
        uuid: params.layar_antrian_uuid,
        transaction: tx,
      });

      if (!existingLayarAntrian) {
        throw new NotFoundException("Data tidak ditemukan");
      }

      const polikliniks = await PoliklinikRepository.findAllByPoliklinikUUIDs({
        faskesUuid,
        poliklinikUuids: layarAntrian.poli_uuids,
        transaction: tx,
      });

      if (polikliniks.length !== layarAntrian.poli_uuids.length) {
        throw new NotFoundException(
          "Terdapat poliklinik yang tidak ditemukan. Request dibatalkan."
        );
      }

      const draftAfterUpdate = {
        ...existingLayarAntrian,
        aktif: existingLayarAntrian.status,
        poli_uuids: existingLayarAntrian.lokasi.map((lokasi) => lokasi.uuid),
        ...layarAntrian,
      };
      delete draftAfterUpdate.lokasi;
      delete draftAfterUpdate.status;

      ZodValidator.validate(LayarAntrianSchema.CREATE, draftAfterUpdate);

      const expectedPayload = FormatterService.toCamelCase(draftAfterUpdate);
      await LayarAntrianRepository.update({
        faskesUuid,
        uuid: layar_antrian_uuid,
        layarAntrian: expectedPayload,
        transaction: tx,
      });

      await LayarAntrianPoliRepository.bulkDelete({
        faskesUuid,
        layarAntrianUuid: layar_antrian_uuid,
        transaction: tx,
      });

      if (draftAfterUpdate.is_poli) {
        await LayarAntrianPoliRepository.bulkCreate({
          faskesUuid,
          layarAntrianUuid: layar_antrian_uuid,
          poliklinikUuids: draftAfterUpdate.poli_uuids,
          transaction: tx,
        });
      }
    });
  }

  static async delete({ faskesUuid, params }) {
    await TransactionService.run(async (tx) => {
      const { layar_antrian_uuid: uuid } = ZodValidator.validate(
        LayarAntrianSchema.LAYAR_ANTRIAN_PARAM,
        params
      );

      const existing = await LayarAntrianRepository.pureFindOne({
        faskesUuid,
        uuid,
      });

      if (!existing) {
        throw new NotFoundException("Data tidak ditemukan");
      }

      await LayarAntrianRepository.delete({
        faskesUuid,
        uuid,
      });

      await LayarAntrianPoliRepository.bulkDelete({
        faskesUuid,
        layarAntrianUuid: uuid,
      });
    });
  }
}
