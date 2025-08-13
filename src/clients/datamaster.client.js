import axios from "axios";

// URL endpoint dari layanan Data Master
const DATAMASTER_API_URL = "http://192.168.1.77:5000/api/v3/datamaster";

export class DataMasterClient {
  /**
   * Mengambil daftar semua poliklinik yang aktif.
   * @param {string} token - Token JWT admin yang sedang login
   * @returns {Promise<Array>} - Daftar data poliklinik
   */
  static async getAktifPoli(token) {
    try {
      const endpoint = `${DATAMASTER_API_URL}/lokasi/poli/aktif`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: token, // Meneruskan token untuk otorisasi
        },
      });

      return response.data.payload || [];
    } catch (error) {
      console.error("Error saat memanggil layanan Data Master:", error.message);
      throw new Error("Gagal terhubung ke layanan Data Master.");
    }
  }
}
