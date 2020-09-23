const MailLib = require('../lib/mail')
const mailLib = new MailLib()

class MailService {
    async sendNewPassword(character_name,email, newHashedPassword) {
        const subject = 'HF - Cambio de contraseña'
        const message = `Hola ${character_name}! tu nueva contraseña momentánea es: \n\n${newHashedPassword}\n\nRecuerda que siempre que estés dentro del sistema, podrás cambiar la contraseña a tu preferencia pulsando el ícono de engranaje que se encuentra en la parte superior izquierda de la pantalla luego de iniciar sesión.`

        const mailResponse = await mailLib.mailUser(email,subject,message)

        try {
            const mailAccepted = mailResponse.accepted[0]

            return mailAccepted
        } catch(err) {
            return {"message": "Mail could not be sended", "error": err}
        }
    }
}

module.exports = MailService