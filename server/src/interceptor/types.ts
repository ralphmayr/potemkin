export interface ChromiumNetworkInterceptionEvent {
  frameId: string;
  interceptionId: string;
  isDownload: boolean;
  isNavigationRequest: boolean;
  request: ChromiumNetworkRequest;
  requestId: string;
  requestType: string;
  responseHeaders: any;
  responseStatusCode: number;
}

export interface ChromiumNetworkRequest {
  headers: any;
  initialPriority: string;
  method: string;
  referrerPolicy: string;
  url: string;
}

export interface InterceptorConfig {
  patterns: MockPattern[];
}

export interface MockPattern {
  urlPattern: string;
  method?: string;
  mockResponse: string;
  mockStatusCode?: number;
}

export interface LocalStorageConfig {
  url: string;
  storageValues: any;
}
