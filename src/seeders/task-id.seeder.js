import moment from "moment";
import { uuidv7 } from "uuidv7";
import AdmissionRJModel from "../models/admission-rj.model.js";
import PencatatTaskIdModel from "../models/pencatat-task-id.model.js";

export class PencatatTaskIdSeeder {
  static async seed() {
    console.log("🌱 Seeding PencatatTaskId...");

    const admissions = await AdmissionRJModel.findAll();

    // filter out admissions without kodeBooking or patient
    const filtered = admissions.filter((admission) => {
      return admission.kodeBooking && admission.patientUuid;
    });

    const taskEntries = filtered.map((admission) => {
      return {
        uuid: uuidv7(),
        patientUuid: admission.patientUuid,
        faskesUuid: admission.faskesUuid,
        kodeBooking: admission.kodeBooking,
        createdAt: moment().unix(),
        taskId: Math.floor(Math.random() * 3) + 1,
      };
    });

    console.log("taskEntries is", taskEntries);
    await PencatatTaskIdModel.bulkCreate(taskEntries);
    console.log("✅ PencatatTaskId seeding completed!");
  }
}
