import { PatientModel } from "@adameds/model-sdk/admisi";
import AdmissionRJModel from "../models/admission-rj.model.js";
import { BirthDetailModel } from "@adameds/model-sdk/admisi";

export class PatientRepository {
  static async findDetailByIdentity({ faskesUuid, identity }) {
    const ret = PatientModel.findOne({
      raw: true,
      nest: true,
      where: {
        faskesUuid,
        noIdentity: identity,
      },
      include: [
        {
          model: AdmissionRJModel,
          as: "admission_rj",
          required: false,
        },
        {
          model: BirthDetailModel,
          as: "birth_detail",
          required: false,
        },
      ],
    });

    return ret;
  }
}
