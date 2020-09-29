const MySqlLib = require('../lib/mysql');
const UsersService = require('../services/users')
const CryptoService = require('../services/crypto')
const { config } = require('../config/index')
const chalk = require('chalk');
const { rejects } = require('assert');
const coupons = require('../utils/schemas/coupons');

class CouponsService {
    constructor(){
        this.couponsCreated
        this.table = 'coupons'
        this.mySqlLib = new MySqlLib()
        this.usersService = new UsersService()
        this.cryptoService = new CryptoService()
    }

    async createCoupons(numberOfCoupons) {
        const coupons = async () => { 
            let couponsCreated = []
            for (let i=0; i<numberOfCoupons; i++) {
                let coupon = await this.usersService.createHash(5) + '-' + await this.usersService.createHash(5) + '-' + await this.usersService.createHash(5)
    
                couponsCreated.push(coupon)
            }
            return couponsCreated
        }
        return await coupons()
    }

    async couponExists(couponEncrypted){

    }

    async addCoupons(couponEncrypted,ouoLink) {

    }
}

module.exports = CouponsService