import { FormatterService } from "../services/formatter.service.js";

/**
 * Membuat struktur pesan sukses yang standar.
 * @param {string} message - Pesan sukses yang ingin ditampilkan.
 * @param {Object} [payload] - Data utama yang ingin dikirim (opsional).
 * @param {Object} [properties] - Metadata atau properti tambahan (opsional).
 * @returns {Object} Objek pesan sukses.
 */
export function generateSuccessMessage(message, payload, properties) {
  return {
    message,
    // Cek jika properties ada, baru jalankan format, jika tidak, biarkan null/undefined.
    properties: properties
      ? FormatterService.toSnakeCase(properties)
      : properties,
    // Cek jika payload ada, baru jalankan format, jika tidak, biarkan null/undefined.
    payload: payload ? FormatterService.toSnakeCase(payload) : payload,
  };
}

/**
 * Membuat struktur pesan error yang standar.
 * @param {string} status - Status umum error (misalnya, "Gagal" atau "Error").
 * @param {string} title - Judul error yang singkat dan jelas (misalnya, "Unauthorized" atau "Not Found").
 * @param {string} detail - Penjelasan detail mengenai error yang terjadi.
 * @returns {Object} Objek pesan error.
 */
export function generateErrorResponse(status, title, detail) {
  return {
    status,
    title,
    detail,
  };
}
