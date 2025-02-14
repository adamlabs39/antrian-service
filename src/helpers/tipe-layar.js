/**
 * Tipe layar
 * @class
 * @classdesc Tipe layar yang tersedia
 * @exports TipeLayar
 *
 */
export class TipeLayar {
  static layar_titles = [
    "layar 3x3 panggilan",
    "layar 3x2 panggilan",
    "layar 3 list 3 panggilan",
    "layar 2 list 2 panggilan",
    "1 list 1 panggilan 1 gambar",
  ];
  static toInt(tipeLayar) {
    const tipeLayarLower = tipeLayar.toLowerCase();
    for (let i = 0; i < this.layar_titles.length; i++) {
      if (this.layar_titles[i] === tipeLayarLower) {
        return i + 1;
      }
    }

    return undefined;
  }

  static toString(tipeLayar) {
    return this.layar_titles[tipeLayar - 1];
  }
}
