import axios from "axios";
import moment from "moment";
import { ADMISI_API_URL } from "../configurations/env.js";
import { handleApiError } from "../exceptions/api-error.handler.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

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

  //fungsi untuk get all rawat jalan sebagai pengecekan duplikasi pendaftran pasien
  static async getAllRawatJalan({ faskesUuid, startDate, endDate, token }) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan`;
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: token,
        },
        params: {
          faskesUuid: faskesUuid,
          start_date: startDate,
          end_date: endDate,
          all: 1,
        },
      });

      return response.data.payload || [];
    } catch (error) {
      handleApiError(error);
    }
  }

  //fungsi untuk mendapatkan data rawat jalan hari ini
  static async getTodayRegistrationCount(token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/today`;
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

  static async updateAntrianFarmasi(rawatJalanUuid, codes, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/farmasi/${rawatJalanUuid}`;

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

  static async printAntrian(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/print-booking`;

      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });

      if (!response.data.payload) {
        throw new NotFoundException(
          "Kode booking tidak ditemukan atau tidak valid"
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

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

  static async updateRawatJalanMobile(
    appointmentUuid,
    body,
    faskesUuid,
    admisiApiKey
  ) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile/${appointmentUuid}`;
      const response = await axios.put(endpoint, body, {
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

  static async checkPatientMobile(body, faskesUuid, apiKey) {
    try {
      const endpoint = `${ADMISI_API_URL}/patient/check-patient`;
      const response = await axios.post(endpoint, body, {
        headers: {
          "x-api-key": apiKey,
          "faskes-uuid": faskesUuid,
        },
      });
      return response.data.payload;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      handleApiError(error);
    }
  }

  //fungsi untuk checkin di apm pada pasien yang mendaftar melalui mobile
  static async checkInBooking(body, token) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/check-booking`;

      const response = await axios.post(endpoint, body, {
        headers: { Authorization: token },
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  //fungsi untuk get all rawat jalan sebagai pengecekan duplikasi pendaftaran pasien yang mendaftar melalui mobile
  static async getAllRawatJalanMobile({
    startDate,
    endDate,
    faskesUuid,
    admisiApiKey,
  }) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile?start_date=${startDate}&end_date=${endDate}`;

      const response = await axios.get(endpoint, {
        headers: {
          "x-api-key": admisiApiKey,
          "faskes-uuid": faskesUuid,
        },
      });

      return response.data.payload || [];
    } catch (error) {
      handleApiError(error);
    }
  }

  static async cancelBookingMobile({ kodeBooking, faskesUuid }, apiKey) {
    try {
      const endpoint = `${ADMISI_API_URL}/rawat-jalan/mobile/cancel`;

      const response = await axios.delete(endpoint, {
        headers: { "x-api-key": apiKey, "faskes-uuid": faskesUuid },
        data: {
          kode_booking: kodeBooking,
        },
      });

      console.log(
        "Successfully cancelled booking in Admisi Service:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error cancelling booking in Admisi Service:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
