require('dotenv').config()

const config = {
    dev: process.env.NODE_ENV,
    port: process.env.PORT || 3000,
    cors: process.env.CORS,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbUserMysql: process.env.DB_USER_MYSQL,
    dbPasswordMysql: process.env.DB_PASSWORD_MYSQL,
    dbHostMysql: process.env.DB_HOST_MYSQL,
    dbNameMysql: process.env.DB_NAME_MYSQL,
    authJwtSecret: process.env.AUTH_JWT_SECRET,
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
    defaultUserPassword: process.env.DEFAULT_USER_PASSWORD,
    publicAapiKeyToken: process.env.PUBLIC_API_KEY_TOKEN,
    privateApiKeyToken: process.env.ADMIN_API_KEY_TOKEN
}

module.exports = { config }