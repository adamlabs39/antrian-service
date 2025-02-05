export class LokasiRepository {
  static async findAllByLokasiUUIDs({ faskesUuid, lokasiUuids, transaction }) {
    return await LokasiModel.findAll({
      raw: true,
      nest: true,
      where: {
        faskes_uuid: faskesUuid,
        uuid: lokasiUuids,
        deletedAt: null,
      },
      transaction,
    });
  }
}
