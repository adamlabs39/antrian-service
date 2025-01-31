import "./configurations/env.js";
import express from "express";
import { APPLICATION_HOST, APPLICATION_PORT } from "./configurations/env.js";
import morgan from "morgan";
import database from "./configurations/db.js";
import { routes } from "./routes/routes.js";
import { errorHandler } from "./middlewares/error-handler.middleware.js";
import cors from "cors";
import { MODELS } from "./models/models-sync.js";
import authorizationSdk from "@adameds/authorization-sdk";

// See is the database is connected.
(async () => {
  await database.authenticate();
})();

// Define the base URL for the API.
const apiBase = process.env.API_BASE || "api";
const apiVersion = process.env.API_VERSION || "v3";
const baseUrl = `/${apiBase}/${apiVersion}/antrian`;

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

// use authorization middleware SDK
app.use(authorizationSdk([]));

// Use the routes and error handler middleware.
app.use(baseUrl, routes);
app.use(errorHandler);

// Start the server.
app.listen(APPLICATION_PORT, APPLICATION_HOST, async () => {
  for (const model of MODELS) {
    await model.sync({ alter: false, force: true });
  }

  // Log telling that the server is successfully running.
  console.log(
    `Server is running on http://${APPLICATION_HOST}:${APPLICATION_PORT}`
  );
});
