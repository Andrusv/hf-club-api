const CryptoJS = require("crypto-js");
const { config } = require('../config/index')

class CryptoService {
    constructor(){
        this.key = config.authDecryptKey
    }

    async encrypt(data){
        var cipher = CryptoJS.AES.encrypt(data, this.key);
        cipher = cipher.toString();
        return cipher
    }

    async decrypt(data){
        var decipher = CryptoJS.AES.decrypt(data, this.key);
        decipher = decipher.toString(CryptoJS.enc.Utf8);
        return decipher
    }
}

module.exports = CryptoService