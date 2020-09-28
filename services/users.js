const MongoLib = require('../lib/mongo');
const MySqlLib = require('../lib/mysql');
const bcryptjs = require('bcryptjs');
const { resolve } = require('path');

class UsersService {
  constructor() {
    this.collection = 'users';
    this.mongoDB = new MongoLib();
    this.mySQL = new MySqlLib();
  }

  async getUserById({ referred_id }) {
    const user = await this.mongoDB.get(this.collection, referred_id );
    return user;
  }

  async getUserByIdMySQL(id){
    const condition = `WHERE user_id='${id}'`

    const user = await this.mySQL.select('*',this.collection,condition)

    return user[0] || {}
  }

  async getUserByEmail({ email }) {
    const [user] = await this.mongoDB.getAll(this.collection, { email });
    return user;
  }

  async createUser({ user }) {
    const { email, password, character_name, referred_id } = user;
    const hashedPassword = await bcryptjs.hash(password, 10);

    const createUserId = await this.mongoDB.create(this.collection, {
      email,
      password: hashedPassword,
      character_name,
      referred_id
    });

    return createUserId;
  }

  async getOrCreateUser({ user }) {
    const queriedUser = await this.getUserByEmail({ email: user.email });

    if (queriedUser) {
      return null
    } else {
      await this.createUser({ user })
      return await this.getUserByEmail({ email: user.email });
    }
  }

  async changeCharacterName( newCharacterName, id ) {
    return await this.mongoDB.update(this.collection,id, { character_name: newCharacterName })
  }

  async changeUserPassword( password, id ) {
    const hashedPassword = await bcryptjs.hash(password, 10);

    return await this.mongoDB.update(this.collection, id, { password: hashedPassword });
  }

  async addReferrer(referred_id, id) {
    const data = { reffers: `${id}` }
    return await this.mongoDB.updateArray(this.collection,referred_id,data)
  }

  async addUser(id){
    const columns = 'user_id'
    return await this.mySQL.insert(this.collection,columns,`'${id}'`)
  }

  async debitBalance(id,withdrawBalance){
    const columns = `balance=balance-${withdrawBalance}`
    const condition = `WHERE user_id='${id}'`
    return await this.mySQL.update(this.collection,columns,condition) || {}
  }

  async createHash(length) {
    return new Promise((resolve,reject) => {
      let result           = '';
      const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;

      for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      resolve( result )
    })
  }
}

module.exports = UsersService;
