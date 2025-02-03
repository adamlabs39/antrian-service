import { HttpException } from "./http-exception.js";

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(404, message);
  }
}
