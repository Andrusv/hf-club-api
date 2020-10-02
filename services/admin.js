const MongoLib = require('../lib/mongo');
const MySqlLib = require('../lib/mysql');

class AdminService {
    constructor(){
        this.mongoLib = new MongoLib()
        this.mySqlLib = new MySqlLib()
    }

    async getStats() {
        const totalWithdrawalBalance = await this.nonAprovedWithdrawalBalance()

        const totalUserBalance = await this.usersBalance()

        const totalCredits = await totalWithdrawalBalance[0].balance + totalUserBalance[0].balance
        
        return totalCredits
    }

    async nonAprovedWithdrawalBalance() {
        const columns = 'SUM(balance) AS balance'
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