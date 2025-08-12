// src/helpers/time-converter.helper.js

export class TimeConverter {
  /**
   * Mengubah format waktu "HH:mm" menjadi total menit dari tengah malam.
   * @param {string} time - Contoh: "09:30"
   * @returns {number} - Contoh: 570
   */
  static toMinutes(time) {
    if (!time || !time.includes(":")) {
      return 0; // Atau lemparkan error jika format tidak valid
    }
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
