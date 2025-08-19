import axios from "axios";
import moment from "moment";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { ADMISI_API_URL } from "../configurations/env.js";


export class AdmisiClient {
  static async checkPatient(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/patient/check-patient/apm`;
      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });
      //pasien lama
      return true;
    } catch (error) {
      if (
        error.response?.data?.errors?.[0]?.type === "Tidak ditemukan" ||
        error.response?.status === 404
      ) {
        // pasien baru
        return false;
      }
      throw error;
    }
  }

  static async createRawatJalan(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/apm`;
      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });
      return response.data.payload;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage =
          error.response.data?.errors?.[0]?.message ||
          "Data pendaftaran tidak valid.";
        throw new BadRequestException(errorMessage);
      }
      console.error(
        "Error saat membuat rawat jalan di layanan Admisi:",
        error.message
      );
      throw new Error("Gagal membuat data pendaftaran di layanan Admisi.");
    }
  }

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
      console.log("Memanggil endpoint:", endpoint);
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: token,
        },
      });
      console.log("Response dari layanan Admisi (DETAIL):", response.data);
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
      console.log("Memanggil endpoint update:", endpoint);

      const response = await axios.put(endpoint, codes, {
        headers: {
          Authorization: token,
        },
        validateStatus: () => true,
      });
      console.log("Response update:", response.data);
      console.log("TESSSS");
      // console.log("response update: ", response);
      console.log("Response dari layanan Admisi:", response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        // Tangani error 400 (Bad Request) dan 404 (Not Found) secara spesifik
        if (error.response.status === 400) {
          const errorMessage =
            error.response.data?.errors?.[0]?.message ||
            "Data untuk update tidak valid.";
          throw new BadRequestException(errorMessage);
        }
        if (error.response.status === 404) {
          throw new NotFoundException(
            "Data rawat jalan yang akan diupdate tidak ditemukan."
          );
        }
      }
      console.error(
        "Error saat mengupdate rawat jalan di layanan Admisi:",
        error.message
      );
      throw new Error("Gagal mengupdate nomor antrian di layanan Admisi.");
    }
  }
}
