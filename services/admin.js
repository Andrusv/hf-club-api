const MongoLib = require('../lib/mongo');
const MySqlLib = require('../lib/mysql');

class AdminService {
    constructor(){
        this.mongoLib = new MongoLib()
        this.mySqlLib = new MySqlLib()
    }

    async getStats() {
        const totalPendingCreditsAndWithdrawals = await this.getTotalPendingCredits()

        const totalCredits = totalPendingCreditsAndWithdrawals.totalCredits
        
        const totalWithdrawals = totalPendingCreditsAndWithdrawals.totalWithdrawals

        const totalCoupons = await this.getTotalUnusedCoupons().then(row => row[0].totalUnusedCoupons)

        return ({
            totalCredits,
            totalWithdrawals,
            totalCoupons
        })
    }

    async getTotalPendingCredits() {
        const totalWithdrawalBalance = await this.nonAprovedWithdrawalsBalance()

        const totalUserBalance = await this.usersBalance()

        const totalCredits = await totalWithdrawalBalance[0].balance + totalUserBalance[0].balance

        const totalWithdrawals = totalWithdrawalBalance[0].totalWithdrawals

        return ({totalCredits,totalWithdrawals})
    }

    async getTotalUnusedCoupons() {
        const columns = 'COUNT(coupon_id) AS totalUnusedCoupons'
        const table = 'coupons'
        const condition = 'WHERE used=0'

        return await this.mySqlLib.select(columns,table,condition)
    }

    async nonAprovedWithdrawalsBalance() {
        const columns = 'SUM(balance) AS balance, COUNT(withdrawal_id) AS totalWithdrawals'
        const table = 'withdrawals'
        const condition = 'WHERE aproved=0'

        return await this.mySqlLib.select(columns,table,condition)
    }

    async usersBalance() {
        const columns = 'SUM(balance) AS balance'
        const table = 'users'
        const condition = 'WHERE banned=0'

        return await this.mySqlLib.select(columns,table,condition)
    }
}

module.exports = AdminService