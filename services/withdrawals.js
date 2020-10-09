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

    async withdrawal(user,withdrawBalance,withdrawalCouponMode) {
        if (withdrawalCouponMode) {
            return await this.withdrawalCouponMode(user,withdrawBalance)
        } else {
            return await this.withdrawalReferrerMode(user,withdrawBalance)
        }
    }

    async withdrawalCouponMode(user,withdrawBalance) {
        if ( user.balance < withdrawBalance ) {
            return ({"error": "El usuario no posee suficientes creditos en su balance"})
        }

        try{
            const balanceDebited = await this.usersService.debitBalance(user.user_id,withdrawBalance)

            if (balanceDebited.changedRows === 1) {

                const withdrawalCreated = await this.createWithdrawal(user.user_id,withdrawBalance,true)

                return ({"balance": user.balance-withdrawBalance, "withdrawalId": withdrawalCreated})
            }
        } catch(err) {
            return {err}
        }
    }

    async withdrawalReferrerMode(user,withdrawBalance) {
        if ( user.referrer_balance < withdrawBalance ) {
            return({"error": "El usuario no posee suficientes creditos en su balance"})
        }

        const referrerBalanceDebited = await this.usersService.debitReferrerBalance(user.user_id,withdrawBalance)

        if (referrerBalanceDebited.changedRows === 1) {
            const withdrawalCreated = await this.createWithdrawal(user.user_id,withdrawBalance,false)

            setTimeout(async () => {
                await this.verifyReferrerCoupons(user.user_id,withdrawBalance, withdrawalCreated)
            }, 500)

            return({"referrerBalance": user.referrer_balance-withdrawBalance, "withdrawalId": withdrawalCreated})
        }
    }

    async getAprovedWithdrawalBalance(user_id) {
        const columns = 'withdrawal_id,balance'
        const condition = `WHERE user_id="${user_id}" AND aproved=1 AND referrer_aproved=0`

        return await this.mySqlLib.select(columns,this.table,condition)
    }

    async setReferrerAproved(withdrawal_id) {
        const columns = 'referrer_aproved=1'
        const condition = `WHERE withdrawal_id=${withdrawal_id}`

        return await this.mySqlLib.update(this.table,columns,condition)
    }

    async updateWithdrawalBalance(withdrawal_id,balance) {
        const columns = `balance=balance+${balance}`
        const condition = `WHERE withdrawal_id="${withdrawal_id}"`

        return await this.mySqlLib.update(this.table,columns,condition)
    }

    async createWithdrawal(user_id,balance,couponWithdrawal) {
        const columns = `couponWithdrawal,user_id,balance`
        const values = `${couponWithdrawal},"${user_id}",${balance}`
        return await this.mySqlLib.insert(this.table,columns,values)
    }

    async verifyReferrerCoupons(user_id,withdrawBalance,withdrawal_id){
        try{
            const { reffers: userReferrals} = await this.usersService.getUserById({ referred_id: user_id })

            const balanceToCheck = withdrawBalance*10

            const checkWithdrawals = await this.checkWithdrawals(userReferrals,balanceToCheck,user_id,withdrawal_id)

            return checkWithdrawals
        } catch(err) {
            return err
        }
    }

    async aproveWithdrawal(withdrawal_id) {
        const columns = `aproved=1, aproved_at=NOW()`
        const condition = `WHERE withdrawal_id="${withdrawal_id}"`

        return await this.mySqlLib.update(this.table,columns,condition)
    }

    async denyWithdrawal(withdrawal_id) {
        const columns = `aproved=2`
        const condition = `WHERE withdrawal_id="${withdrawal_id}"`

        return await this.mySqlLib.update(this.table,columns,condition)
    }

    async checkWithdrawals(userReferrals,balanceToCheck,user_id,withdrawal_id) {
        
        let withdrawalsChecked = false
        let balanceCounter = 0

        try{
            const checkReferrersWithdrawals = async () => {
                    for (let i = 0; i < userReferrals.length; i++) {
                        const referrerWithdrawalBalances = await this.getAprovedWithdrawalBalance(userReferrals[i])

                        for (let j = 0; j < referrerWithdrawalBalances.length; j++) {
                            balanceCounter = balanceCounter + referrerWithdrawalBalances[j].balance

                            await this.setReferrerAproved(referrerWithdrawalBalances[j].withdrawal_id)

                            if ( balanceCounter === balanceToCheck ) {
                                await this.aproveWithdrawal(withdrawal_id)
                                return withdrawalsChecked = true
                            }

                            if ( balanceCounter > balanceToCheck ) {
                                const newBalance = (balanceCounter-balanceToCheck)*0.1
                                await this.usersService.debitReferrerBalance(user_id,newBalance)
                                await this.updateWithdrawalBalance(withdrawal_id,newBalance)
                                await this.aproveWithdrawal(withdrawal_id)
                                return withdrawalsChecked = true
                            }
                        }
                    }
            }

            await checkReferrersWithdrawals()

            if ( !withdrawalsChecked ) {
                await this.denyWithdrawal(withdrawal_id)
                console.log('Withdrawal Denied!! :c')
            }

            return withdrawalsChecked
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