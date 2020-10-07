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
    emailSender: process.env.EMAIL_SENDER,
    emailPassword: process.env.EMAIL_PASSWORD,
    emailSenderService: process.env.EMAIL_SENDER_SERVICE,
    authDecryptKey: process.env.AUTH_DECRYPT_KEY,
    domain: process.env.DOMAIN,
    adminApi: process.env.ADMIN_API,
    adminEmail: process.env.ADMIN_EMAIL,
    couponValue: process.env.COUPON_VALUE,
    referrerCouponValue: process.env.REFERRER_COUPON_VALUE
}

module.exports = { config }