import { DataTypes, Model } from "sequelize";
import database from "../configurations/db.js";
import { hookModel } from "./hook-model.js";

export default class AntrianModel extends Model {}

AntrianModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    patientUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    admissionRjUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusPanggilan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment:
        "1: panggil, 2: lewati, 3: proses, 4: selesai, 5: verifikasi obat, 6: penyerahan obat",
    },
    pelayanan: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    jenisPasien: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pasienBaru: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    jenisResep: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: function () {
        return moment().unix();
      },
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
    sequelize: database.getSequelize(),
    modelName: "Antrian",
    tableName: "antrian",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);
