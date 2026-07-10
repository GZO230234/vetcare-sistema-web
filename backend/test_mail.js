require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("Probando conexión con Gmail...");
console.log("Usuario:", process.env.EMAIL_USER);
console.log("Contraseña cargada (oculta):", process.env.EMAIL_PASS ? "SÍ (longitud: " + process.env.EMAIL_PASS.length + ")" : "NO");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("\n❌ Error de autenticación de Gmail:");
    console.error(error.message);
    console.log("\nPor favor verifica que:");
    console.log("1. La Verificación en dos pasos esté ACTIVADA en tu cuenta de Google.");
    console.log("2. Hayas generado una 'Contraseña de aplicación' nueva (de 16 letras) y la hayas copiado SIN ESPACIOS.");
    console.log("3. El correo de EMAIL_USER sea exactamente el dueño de esa contraseña.");
  } else {
    console.log("\n✅ ¡Conexión exitosa! El servidor está listo para enviar mensajes.");
  }
});
