import { DataTypes, Model } from "sequelize";
import database from "../configurations/db.js";
import { hookModel } from "./hook-model.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

export default class ReportAntrianModel extends Model {}

ReportAntrianModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      defaultValue: function () {
        return uuidv7();
      },
      allowNull: false,
      unique: true,
    },
    faskesUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tanggalPelayanan: {
      type: DataTypes.DATEONLY, 
      allowNull: false,
    },
    jadwalDokterUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    practitionerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    locationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    kuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kuotaTerpakai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kuotaSisa: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    sequelize: database.getSequelize(),
    modelName: "ReportAntrian",
    tableName: "report_antrian",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);
