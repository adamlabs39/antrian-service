import { HttpException } from "./http-exception.js";

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}
