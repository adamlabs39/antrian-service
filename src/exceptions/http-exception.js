/**
 * @Throwable
 * @class HttpException
 *
 * Will be thrown when an error occurs in the application.
 * @Note - This class is not meant to be used directly.
 */
export class HttpException extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }
  