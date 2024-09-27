import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Comfirm your new account',
            text: 'UpTask - Comfirm your new account',
            html: `<p>Hello: ${user.name}, has created your UpTask account, almost all is ready, you just need confirm your account</p>
                <p>Enter the next link:</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
                <br>
                <p>Enter this code: <b>${user.token}</b></p>
                <p>This token expires in 10 minutes</p>           
            `
        })

        console.log('Message sent', info.messageId)
    }
}