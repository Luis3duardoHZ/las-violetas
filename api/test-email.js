const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  try {
    const transporte = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    await transporte.verify();

    await transporte.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.DOCTOR_EMAIL,
      subject: 'Prueba de email - Las Violetas',
      text: 'Si recibes este mensaje, el sistema de emails funciona correctamente.'
    });

    res.status(200).json({ ok: true, message: 'Email enviado a ' + process.env.DOCTOR_EMAIL });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, code: e.code });
  }
};
