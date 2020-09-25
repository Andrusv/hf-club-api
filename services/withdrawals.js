const MySqlLib = require('../lib/mysql');
const debug = require('debug')
const chalk = require('chalk')

class WithdrawalsService{
    constructor(){
        this.table = 'withdrawals'
        this.mySQL = new MySqlLib();
    }

    async getWithdrawals(id) {
        const condition = `WHERE user_id='${id}'`
        const columns = 'withdrawal_id,DATE_FORMAT(created_at,"%d/%m/%Y") AS created_at,balance,received,aproved'

        const withdrawals = await this.mySQL.select(columns,this.table,condition)

        return withdrawals
    }
}

module.exports = WithdrawalsService