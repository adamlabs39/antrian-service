import { ZodError } from "zod";
import jwt from "jsonwebtoken"; // Correct import for CommonJS module
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";

const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = jwt;

/**
 * Thrown Error will be caught here.
 * @Objective - Formats the error response.
 */
export const errorHandler = (err, req, res, next) => {
  console.log("[ERROR] ---\n", err.stack, "\n---");
  console.log(err.message)

  if (err instanceof ZodError) {
    const status = 400;

    let formattedErrors = "";
    err.errors.forEach((error) => {
      formattedErrors += `${error.message}`;
      if (error.path.length > 0) {
        formattedErrors += ` at ${error.path.join(".")}, `;
      }
    });

    res.status(status).json({
      success: false,
      message: formattedErrors.trim(),
      data: null,
    });
    return;
  }

  if (
    err instanceof JsonWebTokenError ||
    err instanceof TokenExpiredError ||
    err instanceof NotBeforeError
  ) {
    const status = 401;
    let message = "Token tidak valid";

    if (err instanceof TokenExpiredError) {
      message = "Token sudah kedaluwarsa";
    } else if (err instanceof NotBeforeError) {
      message = "Token belum berlaku";
    }

    res.status(status).json({
      message: "Authorization token tidak valid",
      errors: [
        {
          type: statusCodes[401],
          message,
        },
      ],
    });
    return;
  }
  if(err instanceof UnauthorizedException){
    res.status(err.status).json(err.message)
  }

  const status = err.status || err.code || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message: "Data gagal ditampilkan",
    errors: [
      {
        type: statusCodes[status] || "Kesalahan tidak diketahui",
        message,
      },
    ],
  });
};

const statusCodes = {
  400: "Request tidak valid",
  401: "Tidak terautentikasi",
  403: "Tidak diizinkan",
  404: "Tidak ditemukan",
  409: "Konflik",
  500: "Kesalahan internal server",
};
