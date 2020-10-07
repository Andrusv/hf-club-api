const MySqlLib = require('../lib/mysql');
const UsersService = require('./users');
const CouponsService = require('../services/coupons')
const { config } = require('../config/index')

class WithdrawalsService{
    constructor(){
        this.table = 'withdrawals';
        this.mySqlLib = new MySqlLib();
        this.usersService = new UsersService();
        this.couponsService = new CouponsService();
        this.referrerCouponValue = config.referrerCouponValue;
    }

    async getWithdrawals(id) {
        const condition = `WHERE user_id='${id}'`
        const columns = 'withdrawal_id,DATE_FORMAT(created_at,"%d/%m/%Y") AS created_at,balance,received,aproved'

        const withdrawals = await this.mySqlLib.select(columns,this.table,condition)

        return withdrawals
    }

    async getAprovedWithdrawals() {
        const columns = 'withdrawal_id,user_id,balance'
        const condition = 'WHERE aproved=1 AND received=0'

        return await this.mySqlLib.select(columns,this.table,condition)
    }

    async createWithdrawal(user_id,balance,couponWithdrawal) {
        const columns = `couponWithdrawal,user_id,balance`
        const values = `${couponWithdrawal},"${user_id}",${balance}`
        return await this.mySqlLib.insert(this.table,columns,values)
    }

    async verifyReferrerCoupons(user_id,withdrawBalance){
        try{
            const { reffers: userReferrals} = await this.usersService.getUserById({ referred_id: user_id })

            const couponsToCheck = withdrawBalance/config.referrerCouponValue
            
            const checkCoupons = await this.checkCoupons(userReferrals,couponsToCheck)

            return checkCoupons
        } catch(err) {
            return err
        }
    }

    async checkCoupons(userReferrals,couponsToCheck) {
        
        let couponsChecked = false

        try{
            const checkReferrersCoupons = async () => {
                    for (let i = 0; i < userReferrals.length; i++) {
                        console.log(userReferrals[i])
                        const [{ totalCoupons }] = await this.couponsService.getNonReferrerAprovedCoupons(userReferrals[i])

                        console.log('Total Coupons: ',totalCoupons)

                        console.log(await this.couponsService.setReferrerCouponAproved(userReferrals[i],couponsToCheck)) 

                        console.log('coupons To Check: ',couponsToCheck)

                        if (totalCoupons >= couponsToCheck) {
                            console.log('TRUE!!')
                            return couponsChecked = true
                        } else {
                            console.log('FALSE!')
                            couponsToCheck = couponsToCheck - totalCoupons
                        }
                    }
            }

            await checkReferrersCoupons()
            return couponsChecked
        } catch(err) {
            return err
        }
    }

    async payWithdrawal(withdrawal_id) {
        const columns = 'received=1'
        const condition = `WHERE withdrawal_id=${withdrawal_id}`

        return this.mySqlLib.update(this.table,columns,condition)
    }
}

module.exports = WithdrawalsService