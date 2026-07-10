const pool = require('../db');
const { generarRecetaPDF } = require('../utils/pdfGenerator');
const { enviarRecetaPDF } = require('../utils/mailer');

exports.crearDiagnostico = async (req, res) => {
  try {
    const { mascota_id, cita_id, encargado_id, encargado_nombre, titulo, descripcion, prescripcion } = req.body;
    
    // Insertar diagnóstico
    const result = await pool.query(
      `INSERT INTO diagnosticos (mascota_id, cita_id, encargado_id, encargado_nombre, titulo, descripcion, prescripcion) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [mascota_id, cita_id || null, encargado_id, encargado_nombre, titulo, descripcion, prescripcion]
    );

    // Obtener información del dueño y la mascota para el PDF
    const mascotaInfo = await pool.query(
      `SELECT m.nombre AS mascota_nombre, m.tipo AS mascota_tipo, u.nombres AS cliente_nombre, u.correo AS cliente_correo 
       FROM mascotas m
       JOIN usuarios u ON m.usuario_id = u.id
       WHERE m.id = $1`,
      [mascota_id]
    );

    if (mascotaInfo.rows.length > 0) {
      const { mascota_nombre, mascota_tipo, cliente_nombre, cliente_correo } = mascotaInfo.rows[0];
      
      const datosPDF = {
        mascota_nombre,
        mascota_tipo,
        cliente_nombre,
        encargado_nombre,
        titulo,
        descripcion,
        prescripcion
      };

      try {
        const pdfBuffer = await generarRecetaPDF(datosPDF);
        // Se envía de forma asíncrona para no trabar la respuesta
        enviarRecetaPDF(cliente_correo, cliente_nombre, mascota_nombre, pdfBuffer);
      } catch (pdfError) {
        console.error('Error generando o enviando el PDF:', pdfError);
      }
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear diagnostico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getDiagnosticosPorCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    const { rows } = await pool.query('SELECT * FROM diagnosticos WHERE cita_id = $1 ORDER BY fecha_creacion DESC', [citaId]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener diagnosticos por cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getDiagnosticosPorMascota = async (req, res) => {
  try {
    const { mascotaId } = req.params;
    const { rows } = await pool.query('SELECT * FROM diagnosticos WHERE mascota_id = $1 ORDER BY fecha_creacion DESC', [mascotaId]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener diagnosticos por mascota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
