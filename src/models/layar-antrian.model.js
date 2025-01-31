import { DataTypes, Model } from "sequelize";
import database from "../configurations/db.js";
import { hookModel } from "./hook-model.js";

export default class LayarAntrianModel extends Model {}

LayarAntrianModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: function () {
        return uuidv7();
      },
      allowNull: false,
      unique: true,
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: false,
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    namaLayar: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipeLayar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isAdmisi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isPoli: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isFarmasi: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    flashText: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    media: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: false,
      defaultValue: () => moment().unix(),
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: false,
    },
    deletedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: false,
    },
  },
  {
    sequelize: database.getSequelize(),
    modelName: "LayarAntrian",
    tableName: "layar_antrian",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);
