const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'joaomiko25@gmail.com',
        pass: 'shro vmth xwtf eupa'
    }
});

exports.enviarEmailConfirmacao = async (destinatario, linkConfirmacao) => {
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

exports.enviarCodigo2FAEmail = async (destinatario, codigo) => {
    await transporter.sendMail({
        from: '"Dice & Tables" <joaomiko257@gmail.com>',
        to: destinatario,
        subject: 'Código de Autenticação',
        html: `
            <p>Olá!</p>
            <p>O teu código de autenticação é:</p>
            <h2>${codigo}</h2>
            <p>Este código é válido por 5 minutos.</p>
        `
    });
};

exports.enviarFaturaCompra = async ({ destinatario, nomeCliente, nomeJogo, preco, nomeCafe }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const qrContent = `Compra: ${nomeJogo} | Cliente: ${nomeCliente} | Café: ${nomeCafe}`;
            const qrDataURL = await QRCode.toDataURL(qrContent);

            const tmpDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir);
            }

            const pdfPath = path.join(tmpDir, `fatura_${Date.now()}.pdf`);
            const doc = new PDFDocument({ margin: 50 });
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Cabeçalho
            doc.fontSize(20).font('Helvetica-Bold').text("Fatura - Dice & Tables", { align: 'center' });
            doc.moveDown();

            // Informações do Cliente e Jogo
            doc.fontSize(12).font('Helvetica').text(`Cliente: ${nomeCliente}`);
            doc.text(`Email: ${destinatario}`);
            doc.moveDown();

            doc.fontSize(14).font('Helvetica-Bold').text("Detalhes da Compra");
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12);
            doc.text(`Jogo: ${nomeJogo}`);
            doc.text(`Preço: ${preco.toFixed(2)} €`);
            doc.text(`Data: ${new Date().toLocaleString('pt-PT')}`);
            doc.moveDown();

            // Informações do café
            doc.fontSize(14).font('Helvetica-Bold').text("Local de Levantamento");
            doc.moveDown(0.5);
            doc.font('Helvetica').fontSize(12);
            doc.text(`Café: ${nomeCafe}`);
            doc.moveDown();

            // QR Code
            doc.fontSize(14).font('Helvetica-Bold').text("QR Code para Levantamento:");
            doc.moveDown(0.5);
            const qrImage = qrDataURL.replace(/^data:image\/png;base64,/, "");
            const qrBuffer = Buffer.from(qrImage, 'base64');
            doc.image(qrBuffer, { width: 120, align: 'center' });
            doc.moveDown();

            // Rodapé
            doc.fontSize(10).fillColor('gray').text("Obrigado por comprares no Dice & Tables!", { align: 'center' });

            doc.end();

            writeStream.on('finish', async () => {
                try {
                    await transporter.sendMail({
                        from: '"Dice & Tables" <joaomiko257@gmail.com>',
                        to: destinatario,
                        subject: 'Obrigado pela tua compra!',
                        html: `
                            <p>Olá ${nomeCliente},</p>
                            <p>Obrigado por comprares o jogo <strong>${nomeJogo}</strong> no nosso café <strong>${nomeCafe}</strong>.</p>
                            <p>Para levantares o teu jogo, dirige-te ao nosso café:</p>
                            <p><strong>${nomeCafe}</strong></p>
                            <p>Mostra o QR Code incluído na fatura em anexo.</p>
                            <p>Até breve!</p>
                        `,
                        attachments: [
                            {
                                filename: 'fatura.pdf',
                                path: pdfPath
                            }
                        ]
                    });

                    fs.unlink(pdfPath, err => {
                        if (err) console.error("Erro ao apagar o PDF temporário:", err);
                    });

                    resolve();
                } catch (emailErr) {
                    reject(emailErr);
                }
            });

            writeStream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};