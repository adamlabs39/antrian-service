export class ServiceUnavailableException extends Error {

  constructor(
    message = "Layanan tidak tersedia saat ini. Silakan coba lagi nanti."
  ) {
    super(message);
    this.name = "ServiceUnavailableException";
    this.status = 503; 
  }
}
