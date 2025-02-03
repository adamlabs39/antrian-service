import { JadwalDokterSeeder } from "./jadwal-dokter.seeder.js";
import { LokasiSeeder } from "./lokasi.seeder.js";
import { PegawaiSeeder } from "./pegawai.seeder.js";
import { PractitionerSeeder } from "./practitioner.seeder.js";

export async function seed() {
  const seeders = [
    LokasiSeeder,
    PegawaiSeeder,
    PractitionerSeeder,
    JadwalDokterSeeder,
  ];

  for (const seeder of seeders) {
    await seeder.seed();
  }
}
