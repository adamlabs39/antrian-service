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

(async () => {
  await database.authenticate();
  defineAssociations();
})();

const API_PREFIX = process.env.API_BASE || "api";
const API_VERSION = process.env.API_VERSION || "v3";
const BASE_URL = `/${API_PREFIX}/${API_VERSION}/antrian`;

const app = express();

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

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(apiKeyMiddleware([`${BASE_URL}/mobile`]));

const jwtExemptEndpoints = [
  `${BASE_URL}/mobile/jadwal-dokter`,
  `${BASE_URL}/mobile/jadwal-dokter/available-kuota`,
  `${BASE_URL}/mobile/apm/process-registration`,
  `${BASE_URL}/mobile/admisi-antrian`,
  `${BASE_URL}/mobile/report-antrian/cancel-booking`,
  `${BASE_URL}/mobile/apm/update-patient`
];

app.use((req, res, next) => {
  const normalized = normalizeUrl(req.originalUrl);
   const isExempt = jwtExemptEndpoints.some((endpoint) =>
     normalized.startsWith(endpoint)
   );

  if (isExempt) {
    return next();
  } else {
    return authorizationSdk([])(req, res, next);
  }
});

console.error();

app.use(BASE_URL, router);
app.use(errorHandler);

app.listen(APPLICATION_PORT, APPLICATION_HOST, async () => {
  console.log(
    `Server is running on http://${APPLICATION_HOST}:${APPLICATION_PORT}`
  );
});
