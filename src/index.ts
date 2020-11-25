import app from './app';
import { logger } from './utils/logger';

console.log("app start");

function normalizePort(val: string): number {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    throw new Error('Port is not a number');
  }
  if (port < 0) {
    throw new Error('Port cannot be negative');
  }
  return port;
}

console.log("settings port")

const DEFAULT_PORT = '4000';
const port = normalizePort(process.env.PORT || DEFAULT_PORT);

function onListening(): void {
  logger.info(`Listening on ${port}`);
  logger.info(`This is the '${process.env.NODE_ENV}' environment`);
  logger.info(`Log Level set to '${process.env.LOG_LEVEL}'`);
}

app.listen(port, onListening);
