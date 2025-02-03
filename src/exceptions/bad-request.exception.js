import { HttpException } from "./http-exception.js";

export class BadRequestException extends HttpException {
  constructor(message = "Bad request") {
    super(400, message);
  }
}
