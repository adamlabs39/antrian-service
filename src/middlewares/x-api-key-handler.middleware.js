import "dotenv/config";
import { HttpException } from "../exceptions/http-exception.js";
import { generateErrorResponse } from "../helpers/generate-message.js";

/**
 * Factory function yang menghasilkan middleware untuk validasi X-API-KEY.
 * @param {string[]} protectedRoutes - Array berisi path rute yang harus dilindungi.
 */
const ANTRIAN_KEY_SECRET = process.env.ANTRIAN_KEY_SECRET;
export function apiKeyMiddleware(protectedRoutes = []) {
  return function (request, response, nextFunction) {
    try {
      const isProtectedRoute = protectedRoutes.some((route) =>
        request.path.startsWith(route)
      );

      if (!isProtectedRoute) {
        return nextFunction();
      }

      const apiKey = request.headers["x-api-key"];
      if (!apiKey) {
        throw new HttpException(
          401,
          generateErrorResponse(
            "Gagal",
            "Unauthorized",
            "X-API-KEY harus dikirimkan"
          )
        );
      }

      // langsung compare dengan env
      if (apiKey !== ANTRIAN_KEY_SECRET) {
        throw new HttpException(
          401,
          generateErrorResponse(
            "Gagal",
            "Unauthorized",
            "X-API-KEY tidak valid"
          )
        );
      }

      nextFunction();
    } catch (error) {
      nextFunction(error);
    }
  };
}
