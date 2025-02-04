import { MODELS } from "./models/models-sync.js";
import { seed } from "./seeders/seeder.js";

for (const model of MODELS) {
  await model.drop();
  await model.sync({ alter: false, force: true });
}
seed();
