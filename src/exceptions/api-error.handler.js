import { BadRequestException } from "./bad-request.exception.js";
import { UnauthorizedException } from "./unauthorized.exception.js";
import { ForbiddenException } from "./forbidden.exception.js";
import { NotFoundException } from "./not-found.exception.js";
import { ConflictException } from "./conflict.exception.js";
import { ServiceUnavailableException } from "./service-unavailable.exception.js";

export function handleApiError(error) {
  // Periksa apakah error berasal dari respons API (memiliki status code)
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400: // Bad Request
        const message400 =
          data?.errors?.[0]?.message ||
          "Data yang dikirim tidak valid atau tidak lengkap.";
        throw new BadRequestException(message400);

      case 401: // Unauthorized
        throw new UnauthorizedException(
          "Autentikasi gagal. Token atau API Key tidak valid."
        );

      case 403: // Forbidden
        throw new ForbiddenException(
          "Anda tidak memiliki izin untuk melakukan aksi ini."
        );

      case 404: // Not Found
        throw new NotFoundException(
          "Sumber daya yang diminta tidak ditemukan."
        );

      case 409: // Conflict
        throw new ConflictException(data?.message || "Terjadi duplikasi data.");

      case 500: // Internal Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
        throw new ServiceUnavailableException(
          `Layanan eksternal sedang mengalami gangguan (Error: ${status}).`
        );

      default:
        throw new Error(
          `Terjadi error tak terduga dari layanan eksternal dengan status ${status}.`
        );
    }
  } else if (error.request) {
    // Error terjadi karena request dikirim tapi tidak ada respons
    throw new Error(
      "Tidak dapat terhubung ke layanan eksternal. Periksa koneksi jaringan."
    );
  } else {
    // Error terjadi saat mempersiapkan request
    throw new Error(
      "Terjadi kesalahan pada aplikasi saat mencoba mengirim data."
    );
  }
}
