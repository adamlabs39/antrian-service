import { HttpException } from "./http-exception.js";

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(409, message);
  }
}
