import { DataTypes, Model, Op } from "sequelize";
import { hookModel } from "./hook-model.js";
import { sequelize } from "../configurations/db.js";
import moment from "moment";

export default class AppointmentModel extends Model {}

AppointmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    faskesUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pasienUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    penjaminUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Metode pembayaran: umum/tunai",
    },
    accountUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tanggalDaftar: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lokasiUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dokterUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    jadwalDokterUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    jadwalPraktek: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    kodeBooking: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    noAntrian: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noAntrianPoli: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noAntrianFarmasi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "0 - Cancel, 1 - Booking, 2 - Checkin, 3 - Discharge",
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
    modelName: "Appointment",
    tableName: "appointment",
    underscored: true,
    timestamps: false,
    hooks: hookModel,
    defaultScope: {
      where: {
        deletedAt: {
          [Op.is]: null,
        },
      },
    },
  }
);
