import axios from "axios";
import moment from "moment";
import { ADMISI_API_URL } from "../configurations/env.js";
import { handleApiError } from "../exceptions/api-error.handler.js";

//fungsi untuk mengecek pasien baru atau lama pada fitur apm
export class AdmisiClient {
  static async checkPatient(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/patient/check-patient/apm`;
      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });
      //pasien lama
      return response.data.payload || null;
    } catch (error) {
      if (
        error.response?.data?.errors?.[0]?.type === "Tidak ditemukan" ||
        error.response?.status === 404
      ) {
        // pasien baru
        return false;
      }
      handleApiError(error);
    }
  }

  //fungsi untuk create pasien dari fitur antrian
  static async createRawatJalan(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/apm`;
      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });
      return response.data.payload;
    } catch (error) {
      handleApiError(error);
    }
  }

  //fungsi untuk mendapatkan data rawat jalan hari ini
  static async getRawatJalanToday(faskesUuid, token) {
    try {
      const startDate = moment().startOf("day").unix();
      const endDate = moment().endOf("day").unix();
      console.log("Mendapatkan data rawat jalan untuk tanggal:", startDate, "sampai", endDate);

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
      handleApiError(error);
    }
  }

  //fungsi untuk mendapatkan detail rawat jalan
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
      handleApiError(error);
    }
  }

  static async updateRawatJalan(rawatJalanUuid, codes, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/${rawatJalanUuid}`;
      console.log("Memanggil endpoint update:", endpoint);

      const response = await axios.put(endpoint, codes, {
        headers: {
          Authorization: token,
        },
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  // FOR MOBILE

  //fungsi untuk create pasien yang melakukan booking dengan menggunakan mobile app
  static async createRawatJalanMobile(body, faskesUuid, admisiApiKey) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile`;
      const response = await axios.post(endpoint, body, {
        headers: {
          "x-api-key": admisiApiKey,
          "faskes-uuid": faskesUuid,
        },
        // validateStatus: () => true
      });

      return response.data.payload;
    } catch (error) {
      handleApiError(error);
    }
  }

  //fungsi untuk memanggil jdaftar rawat jalan hari ini untuk menghitung nomor antrian admisi khusus mobile
  static async getRawatJalanTodayMobile(faskesUuid, admisiApiKey) {
    try {
      const startDate = moment().startOf("day").unix();
      const endDate = moment().endOf("day").unix();
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile`;
      const response = await axios.get(endpoint, {
        headers: {
          "x-api-key": admisiApiKey,
          "faskes-uuid": faskesUuid,
        },
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      return response.data.payload || [];
    } catch (error) {
      handleApiError(error);
    }
  }
}
