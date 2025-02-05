import { BadRequestException } from "../exceptions/bad-request.exception.js";

export default class ZodValidator {
  static validate(schema, objectValidate) {
    try {
      return schema.parse(objectValidate);
    } catch (error) {
      if (!error.errors) {
        throw new BadRequestException(error.message);
      }
      const errorMessage = error.errors.map((err) => {
        return `${err.path} ${err.message}`;
      });

      throw new BadRequestException(errorMessage);
    }
  }
}
