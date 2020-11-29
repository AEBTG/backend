import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as mongoose from 'mongoose';

import router from './router';
import { requestLogger } from './middleware/request-logger';
import { logger } from './utils/logger';
import { mongoUri, mongooseOptions } from './config/database';

import * as AEFetchService from './services/AEFetchService';
import * as ContractController from './Aeternity/contract-controller';

import * as IssuedAddress from './model/IssuedAddresses';

dotenv.config();

// if (!process.env.PORT) {
//   console.log("No Port");
//   process.exit(1);
// }

const app = express();

logger.info(`Running version ${process.env.APP_VERSION || "'local'"}`);

mongoose
  .connect(mongoUri, mongooseOptions)
  .then(() => {
    logger.debug('Connected to database');
  })
  .catch(err => {
    logger.error('Could not connect to database');
    logger.error(err);
  });

AEFetchService.startService();
AEFetchService.getAllTransactions();
ContractController.initialize();

app.use(helmet());
app.use(cors());
// app.use(express.json());
app.use(requestLogger);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(router);

export default app;
