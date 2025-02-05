import { BadRequestException } from "../exceptions/bad-request.exception.js";

export default class ZodValidator {
  static validate(schema, objectValidate) {
    try {
      return schema.parse(objectValidate);
    } catch (error) {
      console.log(error);
      if (!error.errors) {
        throw new BadRequestException("Invalid request");
      }
      const errorMessage = error.errors.map((err) => {
        return `${err.path} ${err.message}`;
      });

      throw new BadRequestException(errorMessage);
    }
  }
}
