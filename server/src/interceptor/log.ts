import { ChromiumNetworkInterceptionEvent, MockPattern } from './types';

export class InterceptionLogEntry {
  private url: string;
  private method: string;
  private mocked = false;
  private contentLength = -1;

  private stringValue: string;

  constructor(e: ChromiumNetworkInterceptionEvent) {
    this.url = e.request.url;
    this.method = e.request.method.toUpperCase();
  }

  public setPattern(pattern: MockPattern) {
    this.contentLength = pattern.mockResponse.length;
  }

  public setMockedResponse(response: any) {
    this.mocked = true;
  }

  public close(): string {
    this.stringValue = `[${this.mocked ? '#' : '_'}] ${this.method} ${this.url}`;

    if (this.contentLength > -1) {
      this.stringValue += ` (${this.contentLength}b)`;
    }

    return this.stringValue;
  }

  public getStringValue() {
    return this.stringValue;
  }
}

export class InterceptionLog {
  private entries: InterceptionLogEntry[] = [];

  public startIntercept(e: ChromiumNetworkInterceptionEvent): InterceptionLogEntry {
    const result = new InterceptionLogEntry(e);
    this.entries.push(result);
    return result;
  }

  public getEntries(): InterceptionLogEntry[] {
    return this.entries;
  }
}