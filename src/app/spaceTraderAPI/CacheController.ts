import type { AxiosResponse, RawAxiosRequestConfig } from "axios";
import type { Meta } from "./api";

export class CacheController<T> {
  limit: number;
  page: number;
  total: number;
  finished: boolean;
  paused: boolean;
  canceled: boolean;
  private putArray: (array: T[]) => void;

  private fetchFunc: (
    page: number,
    limit: number,
    options?: RawAxiosRequestConfig,
  ) => Promise<AxiosResponse<{ data: Array<T>; meta: Meta }>>;

  private _continueResolve: () => void = () => {};
  private tokens: number;
  private maxTokens: number;
  private tokenRate: number;
  private lastTokenTime: number;

  constructor(
    fetchFunc: (
      page: number,
      limit: number,
      options?: RawAxiosRequestConfig | undefined,
    ) => Promise<AxiosResponse<{ data: T[]; meta: Meta }, any>>,
    putArray: (array: T[]) => void,
    limit: number = 20,
    requestsPerSecond: number = 2, // Default rate limit: 2 requests per second
  ) {
    this.fetchFunc = fetchFunc;
    this.putArray = putArray;
    this.limit = limit;
    this.page = 1;
    this.total = 0;
    this.finished = false;
    this.paused = false;
    this.canceled = false;

    // Token bucket initialization
    this.tokens = requestsPerSecond;
    this.maxTokens = requestsPerSecond;
    this.tokenRate = requestsPerSecond;
    this.lastTokenTime = Date.now();
  }

  async fetchAll(onProgress: (progress: number, total: number) => void) {
    while (!this.finished && !this.canceled) {
      await this.addTokens();

      if (this.tokens <= 0) {
        await this.delay(100); // Small delay if no tokens are available
        continue;
      }

      if (this.paused) {
        await this.waitForContinue();
      }

      if (this.canceled) break;

      this.tokens--; // Consume a token

      const response = await this.fetchFunc(this.page, this.limit);

      const systems = response.data.data;
      this.total = response.data.meta.total;

      this.putArray(systems);

      onProgress?.((this.page - 1) * this.limit + systems.length, this.total);

      if (systems.length === 0 || this.page * this.limit >= this.total) {
        this.finished = true;
      }

      this.page++;
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async addTokens() {
    const now = Date.now();
    const elapsed = now - this.lastTokenTime;

    if (elapsed > 1000) {
      this.tokens = Math.min(
        this.maxTokens,
        this.tokens + Math.floor((elapsed / 1000) * this.tokenRate),
      );
      this.lastTokenTime = now;
    }
  }

  waitForContinue() {
    return new Promise<void>((resolve) => {
      this._continueResolve = resolve;
    });
  }

  pause() {
    this.paused = true;
  }

  continue() {
    if (this.paused) {
      this.paused = false;
      this._continueResolve();
    }
  }

  cancel() {
    this.canceled = true;
    this.finished = true; // Ensure the loop exits
  }

  reset() {
    this.page = 1;
    this.total = 0;
    this.finished = false;
    this.paused = false;
    this.canceled = false;
  }
}
