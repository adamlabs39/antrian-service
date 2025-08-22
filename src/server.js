import "./configurations/env.js";
import express from "express";
import { APPLICATION_HOST, APPLICATION_PORT } from "./configurations/env.js";
import morgan from "morgan";
import database from "./configurations/db.js";
import { router } from "./routes/routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import cors from "cors";
import authorizationSdk from "@adameds/authorization-sdk";
import { apiKeyMiddleware } from "./middlewares/x-api-key-handler.middleware.js";
import { defineAssociations } from "./models/associations.js";
import { normalizeUrl } from "./helpers/url-normalizer.js";

// See if the database is connected.
(async () => {
  await database.authenticate();
  defineAssociations();
})();

// Define the base URL for the API.
const API_PREFIX = process.env.API_BASE || "api";
const API_VERSION = process.env.API_VERSION || "v3";
const BASE_URL = `/${API_PREFIX}/${API_VERSION}/antrian`;

const app = express();

// Use the cors middleware to allow cross-origin requests.
app.use(
  cors({
    origin: "*",
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "Accept",
      "User-Agent",
      "Content-Length",
      "Authorization",
      "x-api-key",
    ],
    methods: ["GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// Use the morgan middleware to log the requests.
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Use the express.json() middleware to parse the body of the request.
app.use(express.json());

// use the express.urlencoded() middleware to parse the URL-encoded data.
app.use(express.urlencoded({ extended: true }));

app.use(apiKeyMiddleware([`${BASE_URL}/mobile`]));

const jwtExemptEndpoints = [
  `${BASE_URL}/mobile/jadwal-dokter`,
  `${BASE_URL}/mobile/jadwal-dokter/available-kuota`,
  `${BASE_URL}/mobile/jadwal-dokter/record-booking`,
  `${BASE_URL}/mobile/apm/process-registration`,
  
];

// console.log("JWT Exempt Endpoints =", jwtExemptEndpoints);

app.use((req, res, next) => {
  const normalized = normalizeUrl(req.originalUrl);
  const isExempt = jwtExemptEndpoints.includes(normalized);

  if (isExempt) {
    return next();
  } else {
    return authorizationSdk([])(req, res, next);
  }
});

console.error();

// Use the routes and error handler middleware.
app.use(BASE_URL, router);
app.use(errorHandler);

// Start the server.
app.listen(APPLICATION_PORT, APPLICATION_HOST, async () => {
  // Log telling that the server is successfully running.
  console.log(
    `Server is running on http://${APPLICATION_HOST}:${APPLICATION_PORT}`
  );
});
