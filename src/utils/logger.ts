import * as winston from 'winston';
import * as chalk from 'chalk';

// only used in 'development' environment
/* istanbul ignore next */
function colorizeHttpMethod(method: string): string {
  switch (method) {
    case 'GET':
      return chalk.green(method);
    case 'POST':
      return chalk.yellow(method);
    case 'PUT':
      return chalk.blue(method);
    case 'DELETE':
      return chalk.red(method);
    default:
      return method;
  }
}

// only used in 'development' environment
/* istanbul ignore next */
function colorizeHttpStatus(httpStatus: string): string {
  const status = parseInt(httpStatus, 10);
  if (status < 300) {
    return chalk.green(status);
  } else {
    return chalk.red(status);
  }
}

// format request details for console
// only used in 'development' environment
/* istanbul ignore next */
function formatAccessLog(info: winston.LogEntry): string {
  const request = JSON.parse(info.message);
  return `${chalk.yellow('request:')}
  ${colorizeHttpStatus(request.statusCode)} ${colorizeHttpMethod(
    request.method
  )} ${request.url}
  Response time: ${request.responseTime}ms
  Request headers:
  ${request.requestHeaders}
  Request body:
  ${request.requestBody}`;
}

// only used in 'development' environment
function formatConsoleLog(entry: winston.LogEntry): string {
  // format error logs
  if (entry.level === 'error') {
    let logEntry = `${entry.level}: ${entry.message}`;
    if (entry.stack) {
      logEntry = `${entry.level}: ${entry.stack}`;
    }
    return logEntry;
  }

  try {
    const logObject = JSON.parse(entry.message);
    // format access logs
    if (logObject.method) {
      return formatAccessLog(entry);
    } else {
      return 'ooooops';
    }
  } catch (err) {
    // format general logs
    return `${entry.level}: ${entry.message}`;
  }
}

// redact request body and headers for log file
// data contained therein must not be logged according to our privacy policy
function redactAccessLog(entry: winston.LogEntry): string {
  const logObject = JSON.parse(entry.message);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { requestBody, requestHeaders, ...logEntry } = logObject;
  return JSON.stringify(logEntry);
}

/* istanbul ignore next */
const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info'
});

let allLogsFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

let accessLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(redactAccessLog)
);

// format the logs on local development environment
// use JSON on servers
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(formatConsoleLog)
  );
  allLogsFormat = devFormat;
  accessLogFormat = devFormat;
}

// set up all logs via winston
const logger = winston.createLogger({
  transports: [consoleTransport],
  format: allLogsFormat,
  exitOnError: false
});

// set up access logs via winston
const accessLogger = winston.createLogger({
  transports: [consoleTransport],
  format: accessLogFormat,
  exitOnError: false
});

((): void => {
  logger.debug(`Logger attached.
`);
})();

export { logger, accessLogger };
