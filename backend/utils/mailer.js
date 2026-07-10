const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarCorreoValidacion = async (correo, token) => {
  const urlVerificacion = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar/${token}`;
  
  const mailOptions = {
    from: `"Vetcare" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Valida tu cuenta de Vetcare',
    html: `
      <h2>¡Bienvenido a Vetcare!</h2>
      <p>Gracias por registrarte. Para poder iniciar sesión y acceder a todas las funcionalidades, necesitas verificar tu correo electrónico.</p>
      <p>Por favor, haz clic en el siguiente enlace para activar tu cuenta:</p>
      <a href="${urlVerificacion}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verificar mi cuenta</a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="font-size: 0.8em; color: #777;">${urlVerificacion}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de validación enviado exitosamente a ${correo}`);
  } catch (error) {
    console.error(`Error al enviar correo a ${correo}:`, error);
  }
};

const enviarRecetaPDF = async (correo, nombreCliente, nombreMascota, pdfBuffer) => {
  const mailOptions = {
    from: `"Vetcare" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: `Receta Médica - ${nombreMascota}`,
    html: `
      <h2>Hola, ${nombreCliente}.</h2>
      <p>Esperamos que <strong>${nombreMascota}</strong> se recupere pronto.</p>
      <p>Adjunto a este correo encontrarás el desglose de la consulta y la receta médica correspondiente.</p>
      <br/>
      <p>Saludos cordiales,</p>
      <p><strong>El equipo de Vetcare</strong></p>
    `,
    attachments: [
      {
        filename: `Receta_${nombreMascota.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Receta PDF enviada exitosamente a ${correo}`);
  } catch (error) {
    console.error(`Error al enviar receta PDF a ${correo}:`, error);
  }
};

module.exports = {
  enviarCorreoValidacion,
  enviarRecetaPDF
};
