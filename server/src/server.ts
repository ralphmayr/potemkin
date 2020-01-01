const express = require('express');
const puppeteer = require('puppeteer');
const request = require('request-promise-native');

import { Application, json, Request, Response } from 'express';
import { Browser } from 'puppeteer';
import { Builder, WebDriver } from 'selenium-webdriver';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome';
import { NetworkInterceptor } from './interceptor/interceptor';
import { ChromiumNetworkInterceptionEvent, LocalStorageConfig, MockPattern } from './interceptor/types';

export class ServerOptions {
  port = 3000;
  debug = true;
}

export class Server {
  private driver: WebDriver;
  private browser: Browser;
  private interceptor: NetworkInterceptor;

  private seleniumServerPort = -1;

  public app: Application;

  constructor(private options: ServerOptions) {
    this.app = express();
    this.app.use(json());
    this.interceptor = new NetworkInterceptor();
  }

  public listen() {
    this.app.listen(this.options.port, () => {
      console.log(`Listening for potemking API requests on http://localhost:${this.options.port}/api`);
      console.log(`Listening for WebDriver requests on http://localhost:${this.options.port}/wd/hub`);
    });

    this.app.get('/wd/*', async (req: Request, res: Response) => {
      await this.forwardWebDriverRequest(req, res);
    });

    this.app.delete('/wd/*', async (req: Request, res: Response) => {
      const url = req.url;

      if (url.startsWith('/wd/hub/session')) {
        if (!this.options.debug) {
          await this.browser.close();
        }

        this.interceptor.clearPatterns();
      }

      await this.forwardWebDriverRequest(req, res);
    });

    this.app.post('/api/patterns', async (req: Request, res: Response) => {
      const patterns = req.body as MockPattern[];

      if (patterns && patterns.length > 0) {
        this.interceptor.setPatterns(patterns.filter(p => this.isValid(p)));
      }

      res.send();
    });

    this.app.post('/api/local-storage', async (req: Request, res: Response) => {
      const localStorageConfig = req.body as LocalStorageConfig;

      if (localStorageConfig && localStorageConfig.url && localStorageConfig.storageValues) {
        await this.configureLocalStorage(this.browser, localStorageConfig);
      }

      res.send();
    });

    this.app.get('/api/log', async (req: Request, res: Response) => {
      const log = this.interceptor.getLog();
      const logEntries = log.getEntries().map(e => e.getStringValue());

      res.send(logEntries);
    });

    this.app.post('/wd/*', async (req: Request, res: Response) => {
      if (req.url === '/wd/hub/session') {
        await this.handleNewSessionRequest(req, res);
      } else {
        await this.forwardWebDriverRequest(req, res);
      }
    });
  }

  private async handleNewSessionRequest(req: Request, res: Response) {
    this.browser = await puppeteer.launch({
      headless: !this.options.debug,
      devtools: !this.options.debug
    }) as Browser;

    const serviceBuilder = new ServiceBuilder('./node_modules/webdriver-manager/selenium/chromedriver_79.0.3945.36');
    serviceBuilder.setPort(9999);

    const builder = new Builder()
      .setChromeService(serviceBuilder)
      .setChromeOptions(this.createChromeOptions(this.browser))
      .forBrowser('chrome');

    this.driver = await builder.build();
    const session = await this.driver.getSession();
    const sessionId = session.getId();

    this.seleniumServerPort = 9999;

    this.configureInterception(this.browser);

    const response = {
      value: {
        capabilities: {
          browserName: 'chrome'
        },
        sessionId
      }
    };

    res.send(response);
  }

  private async forwardWebDriverRequest(req: Request, res: Response) {
    const reqBody = JSON.stringify(req.body);

    const endpoint = req.url.substr(7);
    const url = `http://localhost:${this.seleniumServerPort}${endpoint}`;

    // console.log(`{#} ${req.method} ${url}`);

    await request(url, {
      method: req.method,
      body: reqBody
    }, async (err: any, seleniumResponse: any, body: any) => {
      res.send(seleniumResponse.body);
    });
  }

  private createChromeOptions(browser: Browser): Options {
    // @ts-ignore
    let debuggerAddress = browser._connection._url as string;
    debuggerAddress = debuggerAddress.substring(5);
    debuggerAddress = debuggerAddress.substring(0, debuggerAddress.indexOf('/'));
    // console.log(ws);

    const options = new Options();
    // @ts-ignore
    options.options_.debuggerAddress = debuggerAddress;
    // @ts-ignore
    options.options_.w3c = false;

    return options;
  }

  private async configureInterception(browser: Browser) {
    const page = (await browser.pages())[0];
    const cdpSession = await page.target().createCDPSession();

    await cdpSession.send('Network.enable');

    await cdpSession.send('Network.setRequestInterception', {
      patterns: [
        { urlPattern: '*', resourceType: 'XHR', interceptionStage: 'HeadersReceived' },
        { urlPattern: '*', resourceType: 'XHR', interceptionStage: 'Request' }
      ]
    });

    cdpSession.on('Network.requestIntercepted', async (e: ChromiumNetworkInterceptionEvent) => {
      this.interceptor.intercept(cdpSession, e);
    });
  }

  private isValid(pattern: MockPattern): boolean {
    return pattern && pattern.urlPattern !== undefined && pattern.mockResponse !== undefined;
  }

  private async configureLocalStorage(browser: Browser, config: LocalStorageConfig) {
    console.log(`Server::configureLocalStorage (${config.url}) ->`);

    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', r => {
      r.respond({
        status: 200,
        contentType: 'text/plain',
        body: 'tweak me.',
      });
    });
    await page.goto(config.url);
    await page.evaluate(values => {
      // tslint:disable-next-line: forin
      for (const key in values) {
        localStorage.setItem(key, values[key]);
      }
    }, config.storageValues);
    await page.close();

    console.log(`Server::configureLocalStorage (${config.url}) <-`);
  }
}
