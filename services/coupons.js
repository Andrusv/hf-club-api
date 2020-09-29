const MySqlLib = require('../lib/mysql');
const UsersService = require('../services/users')
const CryptoService = require('../services/crypto')
const { config } = require('../config/index')
const chalk = require('chalk');

class CouponsService {
    constructor(){
        this.couponsCreated
        this.table = 'coupons'
        this.mySqlLib = new MySqlLib()
        this.usersService = new UsersService()
        this.cryptoService = new CryptoService()
    }

    async createCoupons(numberOfCoupons) {
        
    }

    async couponExists(couponEncrypted){

    }

    async addCoupons(couponEncrypted,ouoLink) {

    }
}

module.exports = CouponsService