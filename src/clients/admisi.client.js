import axios from "axios";
import moment from "moment";
import { ADMISI_API_URL } from "../configurations/env.js";
import { handleApiError } from "../exceptions/api-error.handler.js";

//fungsi untuk mengecek pasien baru atau lama pada fitur apm
export class AdmisiClient {
  static async checkPatient(body, token) {
    console.log("Request Body:", body);
    try {
      const endpoint = `${ADMISI_API_URL}/patient/check-patient/apm`;
      console.log("Memanggil endpoint:", endpoint);
      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });
      console.log("Response from checkPatient:", response.data);
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
  static async getTodayRegistrationCount(token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/today`;
      console.log("Memanggil endpoint:", endpoint);
      const response = await axios.get(endpoint, {
        headers: { Authorization: token },
      });
      return response.data.payload.jumlah || 0;
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
        
      });

      return response.data.payload;
    } catch (error) {
      handleApiError(error);
    }
  }

  //fungsi untuk memanggil jdaftar rawat jalan hari ini untuk menghitung nomor antrian admisi khusus mobile
  static async getTodayRegistrationCountMobile(faskesUuid, admisiApiKey) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile/today`;
      
      const response = await axios.get(endpoint, {
        headers: {
          "x-api-key": admisiApiKey,
          "faskes-uuid": faskesUuid,
        },
       
      });
      return response.data.payload.jumlah || 0;
    } catch (error) {
      handleApiError(error);
    }
  }
}
