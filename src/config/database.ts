import * as mongoose from 'mongoose';

(mongoose as any).Promise = global.Promise;

let mongoUri: string;

if (process.env.DB_URI) {
  mongoUri = process.env.DB_URI;
} else if (process.env.NODE_ENV == 'test') {
  mongoUri = 'mongodb://localhost:27017/aeBTG-test';
} else {
  mongoUri = 'mongodb://localhost:27017/aeBTG';
}

const mongooseOptions: any = {
  connectTimeoutMS: 30000,
  keepAlive: 1,
  retryWrites: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  // user: 'aeBTG',
  // pass: '123456'
};

export { mongoUri, mongooseOptions };