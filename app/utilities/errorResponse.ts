export class ErrorResponse extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }

  toJSON() {
    return { message: this.message };
  }
}
