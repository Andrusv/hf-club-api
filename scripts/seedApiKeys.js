// DEBUG=app:* node scripts/mongo/seedApiKeys.js

const chalk = require('chalk');
const crypto = require('crypto');
const debug = require('debug')('app:scripts:api-keys');
const MongoLib = require('../lib/mongo');

const mongodbAdminScopes = [
  'signin:auth',
  'signup:auth',
  'read:users',
  'create:users',
  'update:users',
  'delete:users'
];

const mysqlAdminScopes = [
    'signin:auth',
    'signup:auth',
    'read:users',
    'create:users',
    'update:users',
    'delete:users',
    'read:codes',
    'read:withdrawals',
    'create:withdrawals',
    'update:withdrawals',
    'delete:withdrawals'
  ];

const apiKeys = [
  {
    token: generateRandomToken(),
    scopes: mongodbAdminScopes
  },
  {
    token: generateRandomToken(),
    scopes: mysqlAdminScopes
  }
];

function generateRandomToken() {
  const buffer = crypto.randomBytes(32);
  return buffer.toString('hex');
}

async function seedApiKeys() {
  try {
    const mongoDB = new MongoLib();

    const promises = apiKeys.map(async apiKey => {
      await mongoDB.create('api-keys', apiKey);
    });

    await Promise.all(promises);
    debug(chalk.green(`${promises.length} api keys have been created succesfully`)); // prettier-ignore
    return process.exit(0);
  } catch (error) {
    debug(chalk.red(error));
    process.exit(1);
  }
}

seedApiKeys();
