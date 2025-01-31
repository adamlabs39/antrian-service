import { ZodError } from "zod";

/**
 * Thrown Error will be caught here.
 * @Objective - Formats the error response.
 */
export const errorHandler = (err, req, res, next) => {
  console.log("[ERROR] ---\n", err.stack, "\n---");

  if (err instanceof ZodError) {
    const status = 400;

    let formattedErrors = "";
    err.errors.map((error) => {
      formattedErrors += `${error.message}`;
      if (error.path.length > 0) {
        formattedErrors += ` at ${error.path.join(".")}, `;
      }
    });

    res.status(status).json({
      success: false,
      message: formattedErrors,
      data: null,
    });
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    data: null,
  });
};
