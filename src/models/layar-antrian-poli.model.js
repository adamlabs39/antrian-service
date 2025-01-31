import { DataTypes, Model } from "sequelize";
import database from "../configurations/db.js";
import { hookModel } from "./hook-model.js";
import { LokasiModel } from "@adameds/model-sdk/datamaster";
import LayarAntrianModel from "./layar-antrian.model.js";

export default class LayarAntrianPoliModel extends Model {}

LayarAntrianPoliModel.init(
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
    lokasiUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    layarAntrianUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    modelName: "LayarAntrianPoli",
    tableName: "layar_antrian_poli",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);

LayarAntrianPoliModel.belongsTo(LokasiModel, {
  foreignKey: "lokasi_uuid",
  as: "lokasi",
  constraints: false,
});

LayarAntrianPoliModel.belongsTo(LayarAntrianModel, {
  foreignKey: "layar_antrian_uuid",
  as: "layar_antrian",
  constraints: false,
});
