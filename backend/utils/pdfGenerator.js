const PDFDocument = require('pdfkit');

/**
 * Genera un PDF en memoria y devuelve un Buffer
 * @param {Object} datos - Contiene datos del diagnostico, mascota, dueño y médico.
 * @returns {Promise<Buffer>}
 */
const generarRecetaPDF = (datos) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Encabezado
      doc.fontSize(24).font('Helvetica-Bold').text('Clínica Veterinaria Vetcare', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Av. Principal #123, Ciudad Central', { align: 'center' });
      doc.text('Teléfono: (555) 123-4567 | Correo: contacto@vetcare.com', { align: 'center' });
      
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Línea separadora
      doc.moveDown(1);

      // Información de la Consulta
      const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      
      doc.fontSize(14).font('Helvetica-Bold').text('RECETA MÉDICA', { align: 'right' });
      doc.fontSize(12).font('Helvetica').text(`Fecha: ${fecha}`, { align: 'right' });
      doc.moveDown(1.5);

      // Datos del Paciente y Cliente
      doc.font('Helvetica-Bold').text('Datos del Paciente:');
      doc.font('Helvetica').text(`Nombre: ${datos.mascota_nombre} (${datos.mascota_tipo})`);
      doc.text(`Dueño: ${datos.cliente_nombre}`);
      doc.moveDown(1);

      // Diagnóstico
      doc.font('Helvetica-Bold').text('Motivo de Consulta / Diagnóstico:');
      doc.font('Helvetica').text(datos.titulo);
      doc.moveDown(0.5);
      doc.text(datos.descripcion, { align: 'justify' });
      
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Prescripción / Tratamiento
      doc.fontSize(14).font('Helvetica-Bold').text('Rx / Prescripción:');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(datos.prescripcion || 'Ninguna prescripción registrada.', { align: 'justify' });
      
      doc.moveDown(4);

      // Firma
      doc.moveTo(200, doc.y).lineTo(400, doc.y).stroke();
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Atendido por: ${datos.encargado_nombre}`, { align: 'center' });
      doc.font('Helvetica').text('Médico Veterinario', { align: 'center' });

      // Finalizar PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generarRecetaPDF
};
