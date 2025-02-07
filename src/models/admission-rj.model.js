import { DataTypes, Model } from "sequelize";
import { hookModel } from "./hook-model.js";
import { sequelize } from "../configurations/db.js";
import { PractitionerModel, LokasiModel } from "@adameds/model-sdk/datamaster";
import moment from "moment";

export default class AdmissionRJModel extends Model {}

AdmissionRJModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1: tunai, 2: asuransi",
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noreg: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    patientUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noAntrianAdmisi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noAntrianPoli: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noRm: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    birthDetailUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    tanggalDaftar: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tanggalPeriksa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    practitionerUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    maternity: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    complaint: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lokasiUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tanggalCheckin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kodeBooking: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    alasanBatal: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusRj: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment:
        "0 - Cancel, 1 - Booking, 2 - Antrian admisi, 3 - Antrian poli, 4 - Diperiksa, 5 - Discharge",
    },
    edukasi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    edukasiText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prognosis: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rencanaTindaklanjut: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rencanaTindaklanjutText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kondisiPasienPulang: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kondisiKeluarLainnya: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusPulang: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusPulangKeterangan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tujuanRujuk: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tujuanRujukLainnya: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transportRujuk: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    transportRujukLainnya: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    rujukInternal: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rujukEksternal: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    instruksiTindakLanjut: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dischargeDate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    petugas: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    rekamMedisUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    labUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    farmasiUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    jadwalPeriksa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jadwalDokterUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    noReferensi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    noPelayanan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: () => moment().unix(),
    },
    updatedAt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    modelName: "AdmissionRJ",
    tableName: "admission_rj",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);

AdmissionRJModel.belongsTo(PractitionerModel, {
  foreignKey: "practitionerUuid",
  as: "practitioner",
  constraints: false,
});

AdmissionRJModel.belongsTo(LokasiModel, {
  foreignKey: "lokasiUuid",
  as: "lokasi",
  constraints: false,
});
