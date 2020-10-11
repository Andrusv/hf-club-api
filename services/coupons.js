const MySqlLib = require('../lib/mysql');
const UsersService = require('../services/users')
const CryptoService = require('../services/crypto')
const moment = require('moment')
const { config } = require('../config/index');

const COUPON_VALUE = config.couponValue
const REFERRER_COUPON_VALUE = config.referrerCouponValue

class CouponsService {
    constructor(){
        this.couponsCreated
        this.table = 'coupons'
        this.mySqlLib = new MySqlLib()
        this.usersService = new UsersService()
        this.cryptoService = new CryptoService()

        this.couponValue = COUPON_VALUE
        this.referrerCouponValue = REFERRER_COUPON_VALUE
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
        const columns = 'coupon'
        const condition = `WHERE coupon="${couponEncrypted}"`

        const exists = await this.mySqlLib.select(columns,this.table,condition)

        if (exists[0]) {
            return
        } else {
            return couponEncrypted
        }
    }

    async addCoupons(couponsEncrypted) {
        const columns = 'coupon'
        
        const addCoupons = async () => {
            let couponsInserted = []
            for (let i = 0; i < couponsEncrypted.length; i++) {
                const values = `"${couponsEncrypted[i]}"`                     
                try{
                    couponsInserted.push(await this.mySqlLib.insert(this.table,columns,values))
                } catch(err) {
                    console.log(err)
                }
            }

            return couponsInserted
        }
        return await addCoupons()
    }

    async getUnusedCoupon(user_id) {
        const columns = 'coupon'
        const condition = `WHERE user_id="${user_id}" AND used=0`

        const unusedLink = await this.mySqlLib.select(columns,this.table,condition)
        
        if (unusedLink[0]) {
            return unusedLink[0].coupon || {}
        } else {
            return false
        }
    }

    async asignCoupon(user_id) {
        const columns = `user_id="${user_id}"`
        const condition = `WHERE user_id is NULL LIMIT 1`

        const couponAsigned = await this.mySqlLib.update(this.table,columns,condition)

        return couponAsigned.affectedRows || false
    }

    async verifyCoupon(user_id,coupon) {
        const columns = 'coupon'
        const condition = `WHERE user_id="${user_id}" AND used=0 LIMIT 1`

        try{
            const couponEncrypted = await this.mySqlLib.select(columns,this.table,condition)

            if (couponEncrypted[0]) {
                const couponDecrypted = await this.cryptoService.decrypt(couponEncrypted[0].coupon)

                if (coupon === couponDecrypted){
                    return this.exchangeCoupon(user_id)
                }
                return "Este cupon no le corresponde a tu keko o no existe :c"
            } else {
                return "Coupon doesn't exist :c"
            }
        } catch(err) {
            return err
        }
    }

    async totalCouponsUsed(user_id) {
        const thisMonthName = moment().format('MMMM')
        const lastMonthName = moment().subtract(1,'months').format('MMMM')
        const monthBeforeLastMonthName = moment().subtract(2,'months').format('MMMM')

        const currentDate = moment().format('YYYY-MM-DD')
        const lastMonthDate = moment().subtract(1,'months').format('YYYY-MM-DD')
        const monthBeforeLastMonthDate = moment().subtract(2,'months').format('YYYY-MM-DD')

        const [{ couponsUsed: thisMonth }] = await this.couponsUsed(user_id,currentDate)
        const [{ couponsUsed: lastMonth }] = await this.couponsUsed(user_id,lastMonthDate)
        const [{ couponsUsed: monthBeforeLastMonth }] = await this.couponsUsed(user_id,monthBeforeLastMonthDate)
        
        const couponsUsed = {
            [thisMonthName]: thisMonth,
            [lastMonthName]: lastMonth,
            [monthBeforeLastMonthName]: monthBeforeLastMonth
        }

        return couponsUsed
    }

    async couponsUsed(user_id,date) {
        const columns = 'COUNT(coupon_id) AS couponsUsed'
        const condition = `WHERE user_id="${user_id}" AND MONTH(used_at)=MONTH("${date}") AND YEAR(used_at)=YEAR("${date}")`

        return await this.mySqlLib.select(columns,this.table,condition)
    }

    async exchangeCoupon(user_id) {
        const columns = `used=1, used_at=NOW()`
        const condition = `WHERE user_id="${user_id}" AND used=0 LIMIT 1`

        const exchange = await this.mySqlLib.update(this.table,columns,condition)

        if (!exchange.changedRows) {
            return 0
        }

        const chiklin = await this.usersService.payCredits(user_id,this.couponValue)

        if (chiklin) {
            return chiklin.changedRows || 0
        }
    }
}

module.exports = CouponsService