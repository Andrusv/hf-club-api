const MySqlLib = require('../lib/mysql');
const debug = require('debug')
const chalk = require('chalk')

class WithdrawalsService{
    constructor(){
        this.table = 'withdrawals'
        this.mySqlLib = new MySqlLib();
    }

    async getWithdrawals(id) {
        const condition = `WHERE user_id='${id}'`
        const columns = 'withdrawal_id,DATE_FORMAT(created_at,"%d/%m/%Y") AS created_at,balance,received,aproved'

        const withdrawals = await this.mySqlLib.select(columns,this.table,condition)

        return withdrawals
    }

    async getAprovedWithdrawals() {
        const columns = 'user_id,balance'
        const condition = 'WHERE aproved=1 AND received=0'

        return await this.mySqlLib.select(columns,this.table,condition)
    }
    
    async createWithdrawal(user_id,balance) {
        const columns = `user_id,balance`
        const values = `"${user_id}",${balance}`
        return await this.mySqlLib.insert(this.table,columns,values)
    }
}

module.exports = WithdrawalsService