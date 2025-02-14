/**
 * Class untuk meng-generate kode booking, nomor rekam medis, nomor registrasi, nomor antrian admisi, dan nomor antrian poli
 * Sesuai dengan kebutuhan aplikasi
 */
export class CodeGenerator {
  static kodeBooking() {
    let result = "";
    result += CodeGenerator.randomDigit() + CodeGenerator.randomDigit();
    result += CodeGenerator.randomAlphabet() + CodeGenerator.randomAlphabet();
    result += CodeGenerator.randomDigit() + CodeGenerator.randomDigit();

    return result;
  }

  static noRm() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      if (Math.random() < 0.5) {
        result += CodeGenerator.randomDigit();
      } else {
        result += CodeGenerator.randomAlphabet();
      }

      if (i % 2 == 1 && i != 5) {
        result += "-";
      }
    }

    return result;
  }

  static noReg(noUrut) {
    if (noUrut > 9999) {
      throw new Error("No Urut melebihi batas");
    } else if (noUrut < 0) {
      throw new Error("No Urut tidak boleh negatif");
    }

    let result = "REG";

    // 2 Digit angka tahun
    result += new Date().getFullYear().toString().slice(-2);

    // 2 Digit bulan
    const month = new Date().getMonth() + 1;

    if (month < 10) {
      result += "0" + month;
    } else {
      result += month;
    }

    // 2 Digit tanggal
    const date = new Date().getDate();

    if (date < 10) {
      result += "0" + date;
    } else {
      result += date;
    }

    // 4 Digit nomor urut
    if (noUrut < 10) {
      result += "000" + noUrut;
    } else if (noUrut < 100) {
      result += "00" + noUrut;
    } else if (noUrut < 1000) {
      result += "0" + noUrut;
    } else {
      result += noUrut;
    }

    return result;
  }

  static noAntrianAdmisi(noUrut) {
    let result = "A";
    // Jadikan 3 digit
    if (noUrut < 10) {
      result += "00" + noUrut;
    } else if (noUrut < 100) {
      result += "0" + noUrut;
    } else {
      result += noUrut;
    }

    return result;
  }

  static noAntrianPoli(kodePoli, kodeDokter, noUrut) {
    // kode poli must be 2 characters
    if (kodePoli.length != 2) {
      throw new Error("Kode Poli harus 2 karakter");
    }

    let result = kodePoli;

    // kode dokter must be two digits
    if (kodeDokter < 10) {
      result += "0" + kodeDokter;
    } else {
      result += kodeDokter;
    }

    // no urut must be 2 digits
    if (noUrut < 10) {
      result += "0" + noUrut;
    } else {
      result += noUrut;
    }

    return result;
  }

  // return string
  static randomDigit() {
    const randomDigit = Math.floor(Math.random() * 10);
    return randomDigit.toString();
  }

  static randomAlphabet() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomAlphabet =
      alphabet[Math.floor(Math.random() * alphabet.length)];
    return randomAlphabet;
  }
}
