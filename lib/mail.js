const nodemailer = require('nodemailer');
const { config } = require('../config/index')

const emailSender = config.emailSender

class MailLib {
    constructor(){
        this.transporter = nodemailer.createTransport({
            service: config.emailSenderService,
            auth: {
            user: emailSender,
            pass: config.emailPassword
        }
        })
    }

    async mailUser(userEmail,subject,message) {
        const mailOptions = {
            from: emailSender,
            to: userEmail,
            subject: subject,
            text: message
        };

        const mailSended = await this.transporter.sendMail(mailOptions)

        return mailSended
        
    }
}

module.exports = MailLib