import JwtUtils from "./helpers/jwt-utils.js";

import { createClient } from "redis";
import "dotenv/config";
import { UUIDS } from "./libs/constants.js";

function generateRedisKeyByJwtToken(token) {
  const [, , signature] = token.split(".");
  return signature.substring(1, 11);
}

// Load Redis environment variables
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_DATABASE = process.env.REDIS_DATABASE || 0;

// Create Redis client
const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  database: Number(REDIS_DATABASE),
});

// Handle Redis connection
redisClient.on("connect", () => console.log("✅ Redis connected!"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));

async function generateJwt() {
  const payload = {
    faskesUuid: UUIDS[0],
  };

  try {
    await redisClient.connect(); // ✅ Ensure Redis is connected

    console.log("Generated JWT...");
    const token = await JwtUtils.sign(payload);

    console.log("Verifying JWT...");
    const author = await JwtUtils.veryfy(token);

    console.log("Setting the Redis...");
    await redisClient.setEx(
      // ✅ Await the Redis command
      `token-${generateRedisKeyByJwtToken(token)}`,
      10800,
      JSON.stringify(author)
    );

    console.log("Payload:", author);
    console.log("Token:", token);

    await redisClient.quit(); // ✅ Gracefully close Redis after the operation
    console.log("✅ Redis connection closed.");
  } catch (error) {
    console.error("❌ Error generating JWT:", error);
  }
}

// Run the function
generateJwt();
