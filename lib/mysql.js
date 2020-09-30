const mysql = require('mysql')
const debug = require('debug')('app:scripts:api-keys');
const chalk = require('chalk');

const { config } = require('../config/index');
const { resolve } = require('path');

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
        if (!MySqlLib.connection) {
            MySqlLib.connection = new Promise((resolve, reject) => {
                this.connector.connect(err => {
                  if (err) {
                    reject(err);
                  }
        
                  debug(chalk.green('Connected succesfully to mysql'));
                  resolve(this.connector);
                });
            });
        }
        return MySqlLib.connection
    }

    async select(columns,table,condition) {
        return new Promise((resolve,reject) => {
                resolve(this.connect())
        }).then(async connection => {
            const SQL_QUERY = `SELECT ${columns} FROM ${table} ${condition}`
            
            return await new Promise( (resolve,reject) => {
                connection.query(SQL_QUERY, (err,inf) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(inf)
                    }
                })
            })
        })
    }

    async insert(table,columns,values){
        return new Promise( (resolve, reject) => {
                resolve(this.connect())
        }).then(async connection => {
            const SQL_QUERY = `INSERT INTO ${table}(${columns}) VALUES(${values})`

            return await new Promise ( (resolve,reject) =>{
            connection.query(SQL_QUERY, (err,result) => {
                if (err) {
                    debug(chalk.red('Error inserting new row in mysql, error: ' + err))
                    reject(null)
                }

                debug(chalk.green('Data inserted!'));
                resolve(result.insertId)
            })})
        })
    }

    async update(table,columns,condition) {
        return new Promise((resolve,reject) => {
                resolve(this.connect())
        }).then(async connection => {
            const SQL_QUERY = `UPDATE ${table} SET ${columns} ${condition}`
            
            return await new Promise( (resolve,reject) => {
                connection.query(SQL_QUERY, (err,inf) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(inf)
                    }
                })
            })
        })
    }
}

module.exports = MySqlLib