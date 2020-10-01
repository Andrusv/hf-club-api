const MySqlLib = require('../lib/mysql');
const UsersService = require('../services/users')
const CryptoService = require('../services/crypto')

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
        const columns = 'coupon'
        const condition = `WHERE coupon="${couponEncrypted}"`

        const exists = await this.mySqlLib.select(columns,this.table,condition)

        if (exists[0]) {
            return
        } else {
            return couponEncrypted
        }
    }

    async addCoupons(couponsEncrypted,ouoLinks) {
        const columns = 'coupon,link'
        
        const addCoupons = async () => {
            let couponsInserted = []
            for (let i = 0; i < ouoLinks.length; i++) {
                const values = `"${couponsEncrypted[i]}","${ouoLinks[i]}"`                     
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

    async getUnusedLink(user_id) {
        const columns = 'link'
        const condition = `WHERE user_id="${user_id}" AND used=0`

        const unusedLink = await this.mySqlLib.select(columns,this.table,condition)

        if (unusedLink[0]) {
            return unusedLink[0].link || {}
        } else {
            return
        }
    }

    async asignLink(user_id) {
        const columns = `user_id="${user_id}"`
        const condition = `WHERE user_id is NULL LIMIT 1`

        const linkAsigned = await this.mySqlLib.update(this.table,columns,condition)

        return linkAsigned.affectedRows || {}
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

    async exchangeCoupon(user_id) {
        const columns = `used=1`
        const condition = `WHERE user_id="${user_id}" AND used=0 LIMIT 1`

        const exchange = await this.mySqlLib.update(this.table,columns,condition)

        if (!exchange.changedRows) {
            return 0
        }

        const chiklin = await this.usersService.payCredits(user_id)

        if (chiklin) {
            return chiklin.changedRows || 0
        }
    }
}

module.exports = CouponsService