import axios from "axios";
import moment from "moment";

// URL endpoint dari layanan Admisi
const ADMISI_API_URL = "http:192.168.1.77:8083/api/v3/admisi";

export class AdmisiClient {
  static async getRawatJalanToday(faskesUuid, token) {
    try {
      const startDate = moment().startOf("day").unix();
      const endDate = moment().endOf("day").unix();

      const response = await axios.get(`${ADMISI_API_URL}/rawat-jalan`, {
        headers: {
          Authorization: token,
        },
        params: {
          faskesUuid: faskesUuid,
          start_date: startDate,
          end_date: endDate,
        },
      });

      return response.data.payload || [];
    } catch (error) {
      console.error("Error saat memanggil layanan Admisi:", error.message);
      throw new Error("Gagal terhubung ke layanan Admisi.");
    }
  }

  static async getRawatJalanDetail(rawatJalanUuid, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/${rawatJalanUuid}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: token,
        },
      });

      return response.data.payload || null;
    } catch (error) {
      console.error("Error saat mengambil detail rawat jalan:", error.message);
      throw new Error(
        "Gagal mengambil detail pendaftaran dari layanan Admisi."
      );
    }
  }

  static async updateRawatJalan(rawatJalanUuid, codes, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/${rawatJalanUuid}`;

      const response = await axios.put(endpoint, codes, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      // debug
      if (error.response) {
        console.error(
          "Error Response from Admisi Service:",
          JSON.stringify(error.response.data, null, 2)
        );
      } else {
        console.error("Error saat memanggil layanan Admisi:", error.message);
      }

      throw new Error("Gagal update nomor antrian di layanan Admisi.");
    }
  }
}
