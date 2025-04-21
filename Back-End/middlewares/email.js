const nodemailer = require('nodemailer');

exports.enviarEmailConfirmacao = async (destinatario, linkConfirmacao) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'joaomiko25@gmail.com',
            pass: 'shro vmth xwtf eupa' 
        }
    });

    await transporter.sendMail({
        from: '"Dice & Tables" <joaomiko257@gmail.com>',
        to: destinatario,
        subject: 'Confirmação de Email',
        html: `
            <p>Olá! Obrigado por te registares no Dice & Tables.</p>
            <p>Clica no link abaixo para confirmar o teu email:</p>
            <a href="${linkConfirmacao}">${linkConfirmacao}</a>
        `
    });
};
