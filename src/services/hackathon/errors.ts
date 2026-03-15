export class HackathonServiceError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HackathonServiceError";
    this.status = status;
  }
}
