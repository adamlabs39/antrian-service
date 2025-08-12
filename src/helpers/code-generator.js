/**
 * Class untuk meng-generate kode booking, nomor rekam medis, nomor registrasi, nomor antrian admisi, dan nomor antrian poli
 * Sesuai dengan kebutuhan aplikasi
 */
export class CodeGenerator {
  static generateKodeBooking() {
    let result = "";
    result += CodeGenerator.randomDigit() + CodeGenerator.randomDigit();
    result += CodeGenerator.randomAlphabet() + CodeGenerator.randomAlphabet();
    result += CodeGenerator.randomDigit() + CodeGenerator.randomDigit();

    return result;
  }

  static generateNoAntrianAdmisi(nomorUrut) {
    return String(nomorUrut).padStart(3, "0");
  }


  static generateNoAntrianPoli(kodePoli, kodeDokter, nomorUrut) {
    const paddedNomor = String(nomorUrut).padStart(3, "0");
    return `${kodePoli}-${kodeDokter}-${paddedNomor}`;
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
