type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private nextTry = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly cooldownTime = 10_000,
  ) {}

  canRequest(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextTry) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }

  success(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  fail(): void {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextTry = Date.now() + this.cooldownTime;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
