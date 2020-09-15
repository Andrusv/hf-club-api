const mysql = require('mysql')
const debug = require('debug')('app:scripts:api-keys');
const chalk = require('chalk');

const { config } = require('../config/index')

const HOST = encodeURIComponent(config.dbHostMysql)
const USER = encodeURIComponent(config.dbUserMysql)
const PASSWORD = encodeURIComponent(config.dbPasswordMysql)
const DB_NAME = config.dbNameMysql

class MySqlLib {
    constructor() {
        this.connector = mysql.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DB_NAME
        })
        this.dbName = DB_NAME
    }

    async connect() {
        MySqlLib.connection = new Promise((resolve, reject) => {
            this.connector.connect(err => {
              if (err) {
                reject(err);
              }
    
              debug(chalk.green('Connected succesfully to mysql'));
              resolve(this.connector);
            });
        });

        return MySqlLib.connection
    }

    async createTable(table) {
        return this.connect().then( connection => {
            const SQL_QUERY = `CREATE TABLE ${table} (name INT)`

            connection.query(SQL_QUERY, (err,result) => {
                if (err) {
                    debug(chalk.red('Error creating table, error: ' + err))
                    return err
                }

                debug(chalk.green('Table created'));
                return result
            })
        })
    }
}

module.exports = MySqlLib