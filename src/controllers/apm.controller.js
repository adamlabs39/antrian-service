import { APMService } from "../services/apm.service.js";
import { FormatterService } from "../services/formatter.service.js";

export class APMController {

  static async registerPatient(req, res, next) {
    try {
      const platform = "APM";
      const { faskesUuid } = req.author;
      const token = req.headers.authorization;

      // Meneruskan semua data pendaftaran ke service
      const result = await APMService.registerPatient({
        faskesUuid,
        body: req.body,
        token,
        platform,
      });

      res.status(201).json(result); // Kirim kembali respons dari service
    } catch (err) {
      next(err);
    }
  }

  // FOR MOBILE

  //registrasi melalui mobile
  static async registerPatientMobile(req, res, next) {
    try {
      const platform = "MOBILE";
      const faskesUuid = req.headers["faskes-uuid"];
      console.log("faskes uuid controller", faskesUuid);

      const result = await APMService.registerPatientMobile({
        faskesUuid,
        body: req.body,
        platform,
      });

      res.status(201).json(result); // Kirim kembali respons dari service
    } catch (err) {
      next(err);
    }
  }
}
