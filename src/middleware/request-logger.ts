import * as morgan from 'morgan';
import { accessLogger } from '../utils/logger';
import { Request, Response } from 'express';

function propertyToString(object: object, property: string): string {
  if (Object.prototype.hasOwnProperty.call(object, property)) {
    return object[property].toString();
  }
  return '';
}

morgan.token('os-version', (req: Request) =>
  propertyToString(req.headers, 'osversion')
);

morgan.token('app-version', (req: Request) =>
  propertyToString(req.headers, 'appversion')
);

morgan.token('build-version', (req: Request) =>
  propertyToString(req.headers, 'buildversion')
);

morgan.token('x-request-id', (req: Request) =>
  propertyToString(req.headers, 'x-request-id')
);

morgan.token('x-forwarded-for', (req: Request) =>
  propertyToString(req.headers, 'x-forwarded-for')
);

morgan.token('x-forwarded-host', (req: Request) =>
  propertyToString(req.headers, 'x-forwarded-host')
);

morgan.token('request-body', (req: Request) =>
  JSON.stringify(req.body, null, 2)
);

morgan.token('request-headers', (req: Request) =>
  JSON.stringify(req.headers, null, 2)
);

function accessLogFormat(
  tokens: morgan.TokenIndexer,
  req: Request,
  res: Response
): string {
  return JSON.stringify({
    remoteAddress: tokens['remote-addr'](req, res),
    timestamp: tokens['date'](req, res, 'iso'),
    method: tokens['method'](req, res),
    url: tokens['url'](req, res),
    requestBody: tokens['request-body'](req, res),
    requestHeaders: tokens['request-headers'](req, res),
    'x-request-id': tokens['x-request-id'](req, res),
    'x-forwarded-for': tokens['x-forwarded-for'](req, res),
    'x-forwarded-host': tokens['x-forwarded-host'](req, res),
    httpVersion: tokens['http-version'](req, res),
    statusCode: Number(tokens['status'](req, res)),
    contentLength: Number(tokens['res'](req, res, 'content-length')),
    referrer: tokens['referrer'](req, res),
    userAgent: tokens['user-agent'](req, res),
    responseTime: Number(tokens['response-time'](req, res)),
    osVersion: tokens['os-version'](req, res),
    appVersion: tokens['app-version'](req, res),
    buildVersion: tokens['build-version'](req, res)
  });
}

const winstonStream = {
  write: (message: string): void => {
    accessLogger.info(message);
  }
};

const requestLogger = morgan(accessLogFormat, {
  stream: winstonStream
});

export { requestLogger };
