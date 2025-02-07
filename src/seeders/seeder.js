import { AdmissionRJSeeder } from "./admission-rj.seeder.js";
import { AntrianSeeder } from "./antrian.seeder.js";
import { JadwalDokterSeeder } from "./jadwal-dokter.seeder.js";
import { LayarAntrianPoliSeeder } from "./layar-antrian-poli.seeder.js";
import { LayarAntrianSeeder } from "./layar-antrian.seeder.js";
import { LokasiSeeder } from "./lokasi.seeder.js";
import { PegawaiSeeder } from "./pegawai.seeder.js";
import { PractitionerSeeder } from "./practitioner.seeder.js";
import { PencatatTaskIdSeeder } from "./task-id.seeder.js";

export async function seed() {
  const seeders = [
    LokasiSeeder,
    LayarAntrianSeeder,
    LayarAntrianPoliSeeder,
    PegawaiSeeder,
    PractitionerSeeder,
    JadwalDokterSeeder,
    AdmissionRJSeeder,
    AntrianSeeder,
    PencatatTaskIdSeeder,
  ];

  for (const seeder of seeders) {
    await seeder.seed();
  }
}
