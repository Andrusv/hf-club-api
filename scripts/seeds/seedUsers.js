// DEBUG=app:* node scripts/mongo/seedUsers.js

const bcryptjs = require('bcryptjs');
const chalk = require('chalk');
const debug = require('debug')('app:scripts:users');
const MongoLib = require('../../lib/mongo');
const { config } = require('../../config/index');

const users = [
  {
    email: 'root@undefined.sh',
    password: '12345',
    character_name: 'ROOT'
  },
  {
    email: 'andresbarrosocl@outlook.com',
    password: '54321',
    character_name: '@ndrus-v'
  }
];

async function createUser(mongoDB, user) {
  const { email, password, character_name } = user;
  const hashedPassword = await bcryptjs.hash(password, 10);

  const userId = await mongoDB.create('users', {
    email,
    password: hashedPassword,
    character_name
  });

  return userId;
}

async function seedUsers() {
  try {
    const mongoDB = new MongoLib();

    const promises = users.map(async user => {
      const userId = await createUser(mongoDB, user);
      debug(chalk.green('User created with id: ', userId));
    });

    await Promise.all(promises);
    return process.exit(0);
  } catch (error) {
    debug(chalk.red(error));
    process.exit(1);
  }
}

seedUsers();
