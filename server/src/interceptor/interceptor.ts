import { CDPSession } from 'puppeteer';
import { InterceptionLog } from './log';
import { ChromiumNetworkInterceptionEvent, MockPattern } from './types';

const btoa = require('btoa');

const ACCEPT_CONTENT_TYPES = ['*/*', 'application/json'];

export class NetworkInterceptor {
  private log: InterceptionLog;

  private patterns: MockPattern[] = [];

  constructor() {
    this.log = new InterceptionLog();
  }

  public setPatterns(patterns: MockPattern[]) {
    console.log(`NetworkInterceptor::setPatterns (${patterns.length}) ->`);
    patterns.forEach(p => console.log(`  ${p.urlPattern} (${p.mockResponse.length})`));
    console.log(`NetworkInterceptor::setPatterns (${patterns.length}) <-`);

    this.patterns = patterns;
  }

  public clearPatterns() {
    this.setPatterns([]);
  }

  public async intercept(cdpSession: CDPSession, e: ChromiumNetworkInterceptionEvent) {
    const logEntry = this.log.startIntercept(e);

    const interceptionId = e.interceptionId;
    const url = e.request.url;

    if (this.shouldIntercept(e)) {
      const pattern = this.getMockPattern(url, e.request.method);

      if (pattern && pattern.mockResponse) {
        logEntry.setPattern(pattern);

        const response = this.createResponse(pattern);

        logEntry.setMockedResponse(response);

        this.continueInterceptedEvent(cdpSession, interceptionId, response);
      } else {
        this.continueInterceptedEvent(cdpSession, interceptionId);
      }
    } else {
      this.continueInterceptedEvent(cdpSession, interceptionId);
    }

    console.log(logEntry.close());
  }

  public getLog(): InterceptionLog {
    return this.log;
  }

  private shouldIntercept(e: ChromiumNetworkInterceptionEvent): boolean {
    const contentType = this.getAcceptHeader(e.request.headers);
    const accept = ACCEPT_CONTENT_TYPES.find(a => contentType.indexOf('') > -1);
    return accept !== undefined;
  }

  private getMockPattern(url: string, method: string): MockPattern {
    const pattern = this.patterns.find(p =>
      url.startsWith(p.urlPattern) &&
      (!p.method || (p.method.toLowerCase() === method.toLowerCase()))
    );

    return pattern;
  }

  private createResponse(pattern: MockPattern): any {
    const responseHeaders = [
      'Date: ' + (new Date()).toUTCString(),
      'Connection: keep-alive',
      'Content-Length: ' + pattern.mockResponse.length,
      'transfer-encoding: chunked',
      'Content-Type: application/json'
    ];
    const statusCode = pattern.mockStatusCode ? pattern.mockStatusCode : 200;

    const response = btoa(`HTTP/1.1 ${statusCode} OK \r\n ${responseHeaders.join('\r\n')} \r\n\r\n ${pattern.mockResponse}`);

    return response;
  }

  private getAcceptHeader(headers: any): string {
    if (!headers) {
      return undefined;
    }
    const acceptheader = Object.keys(headers).find(k => k.toLowerCase() === 'accept');
    const accept = headers[acceptheader];
    return accept;
  }

  private continueInterceptedEvent(cdpSession: CDPSession, interceptionId: string, rawResponse?: any) {
    cdpSession.send('Network.continueInterceptedRequest', {
      interceptionId,
      rawResponse
    });
  }
}
