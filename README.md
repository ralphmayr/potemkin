# potemkin

potemkin is a simple tool to mock JSON responses when testing web apps.

## Why?

Testing complex web applications is hard. One of the main pain points for us at [Cockpit365](https://cockpit365.com/en/) is the fact that deploying a full instance of the product for testing purposes takes a considerable amount of time that we don't want to spend in our fast-turnaround CI tests.

By mocking the JSON responses of the backend during the frontend UI tests we can avoid provisioning a full backend. That approach has other tangible benefits as well:

* We can easily test corner cases (password, expired, first-time login, ...) without having to maintain a large number of different sets of test databases.
* We can test how our frontend behaves with peculiar timing scenarios (long latency, low bandwidth, ...). 
* Testing with a mocked backend is considerably faster: Not only can we avoid the time it takes to build, deploy, and start a backend instance, the requests themselves are faster as well, as they don't need to go through the entire backend application stack.

## How?

potemkin uses [Puppeteer](https://github.com/puppeteer/puppeteer) to launch Chromium and intercept the network requests the web app would otherwise make to its backend service. Which requests to intercept, and with which responses, can be dynamically configured using the [API](#API).

potemkin also exposes the [Selenium W3C protocol](https://www.w3.org/TR/webdriver/) via which any test tool that supports [Selenium Grid](https://github.com/SeleniumHQ/selenium/wiki/Grid2) can test against the mocked Chromium. That includes popular tools like [webdriverio](https://webdriver.io/) and [Protractor](https://www.protractortest.org/#).

## Example

TODO

## API

TODO

## Caution

A comprehensive test suite for a complex web app includes many different types of tests (unit tests, API tests, performance tests, UI tests, end-to-end tests, ...) as well as constant production monitoring.

Testing web frontends with a mocked backend may be fast and convenient, but it is no way to ensure consistent end-to-end quality. Use this method as another arrow in your quiver for specific scenarios, but don't rely on it entirely.