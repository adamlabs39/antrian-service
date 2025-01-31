import { HttpException } from "./http-exception";

export class BadRequestException extends HttpException {
  constructor(message = "Bad request") {
    super(400, message);
  }
}
