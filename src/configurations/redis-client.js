import { createClient } from "redis";
import "dotenv/config";

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_USERNAME = process.env.REDIS_USERNAME;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_DATABASE = process.env.REDIS_DATABASE;
const redisClient = createClient({
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  database: REDIS_DATABASE,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});
export default redisClient;