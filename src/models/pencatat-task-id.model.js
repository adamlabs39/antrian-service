import { DataTypes, Model } from "sequelize";
import database from "../configurations/db.js";
import { hookModel } from "./hook-model.js";
import { uuidv7 } from "uuidv7";
import moment from "moment";

export default class PencatatTaskIdModel extends Model {}

PencatatTaskIdModel.init(
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
      defaultValue: () => uuidv7(),
      allowNull: false,
      unique: true,
    },
    patientUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kodeBooking: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => moment().unix(),
    },
    updatedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    sequelize: database.getSequelize(),
    modelName: "PencatatTaskId",
    tableName: "pencatat_task_id",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
  }
);
