import { HttpException } from "./http-exception.js";

export class UnauthorizedException extends HttpException {
  constructor(message) {
    super(401, message);
    this.message = message;
  }
}
