import { HttpException } from "./http-exception.js";

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}
