export class Logger {
  constructor(private debugMode = false) {}
  private prefix = 'Frontmatter User Timestamps';

  debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[${this.prefix} Debug] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`[${this.prefix} Info] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.prefix} Warning] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[${this.prefix} Error] ${message}`, ...args);
  }

  group(label: string): void {
    if (this.debugMode) {
      console.group(`[${this.prefix} ${label}]`);
    }
  }

  groupEnd(): void {
    if (this.debugMode) {
      console.groupEnd();
    }
  }

  logPerformance<T>(label: string, fn: () => T): T {
    if (!this.debugMode) {
      return fn();
    }

    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.debug(`Performance [${label}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }

  async logAsyncPerformance<T>(
    label: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.debugMode) {
      return fn();
    }

    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    this.debug(`Performance [${label}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}
