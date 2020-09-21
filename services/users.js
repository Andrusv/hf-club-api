const MongoLib = require('../lib/mongo');
const MySqlLib = require('../lib/mysql');
const bcryptjs = require('bcryptjs');

class UsersService {
  constructor() {
    this.collection = 'users';
    this.mongoDB = new MongoLib();
    this.mySQL = new MySqlLib;
  }

  async getUserById({ referred_id }) {
    const user = await this.mongoDB.get(this.collection, referred_id );
    return user;
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

  createHash(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

module.exports = UsersService;
