import { Sequelize } from "sequelize";

/**
 * Database class to handle the connection to the database
 * and provide the Sequelize instance
 *
 * @class Database
 * Singleton class to handle the connection to the database
 */
export class Database {
  constructor() {
    if (!Database.instance) {
      const DB_NAME = process.env.DB_NAME;
      const DB_USERNAME = process.env.DB_USERNAME;
      const DB_PASSWORD = process.env.DB_PASSWORD;
      const DB_HOST = process.env.DB_HOST;
      const DB_PORT = process.env.DB_PORT;

      this.sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: "postgres",
        pool: {
          min: 5,
          max: 10,
        },
      });

      Database.instance = this;
    }
    return Database.instance;
  }

  // Test to see if the connection is successful
  async authenticate() {
    try {
      await this.sequelize.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  }

  // Get the Sequelize instance
  getSequelize() {
    return this.sequelize;
  }
}

// Create a new instance of the Database class
const database = new Database();

// Freeze the object to prevent modification
Object.freeze(database);

export default database;
