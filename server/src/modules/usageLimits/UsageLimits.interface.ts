export class UsageLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageLimitExceededError";
  }
}
