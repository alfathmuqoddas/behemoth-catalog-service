import { Sequelize, Options } from "sequelize";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

const connectionOptions: Options = {
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),

  logging: (msg) => logger.debug(msg),

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },

  dialectOptions: {},
};

const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD,
  connectionOptions
);

export default sequelize;
