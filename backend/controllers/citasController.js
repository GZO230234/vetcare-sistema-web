const pool = require('../db');

exports.getTodasCitas = async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
             m.nombre as mascota_nombre, m.tipo as mascota_tipo, m.raza as mascota_raza, m.edad as mascota_edad, m.descripcion as mascota_descripcion,
             u.nombres as cliente_nombre, u.apellidos as cliente_apellido, u.correo as cliente_correo, u.telefono as cliente_telefono, u.direccion as cliente_direccion
      FROM citas c
      JOIN mascotas m ON c.mascota_id = m.id
      JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.fecha ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener todas las citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.getCitasUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    // Join with mascotas to get the pet name
    const query = `
      SELECT c.*, m.nombre as mascota_nombre 
      FROM citas c
      JOIN mascotas m ON c.mascota_id = m.id
      WHERE c.usuario_id = $1
      ORDER BY c.fecha ASC
    `;
    const { rows } = await pool.query(query, [usuarioId]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.crearCita = async (req, res) => {
  try {
    const { usuario_id, mascota_id, fecha, descripcion, estatus_cobro } = req.body;
    const usuarioId = usuario_id;

    // Validate date is >= 2 days in the future
    const citaDate = new Date(fecha);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0); // start of the day 2 days from now

    if (citaDate < minDate) {
      return res.status(400).json({ error: 'La cita debe programarse al menos con 2 días de anticipación.' });
    }

    const result = await pool.query(
      `INSERT INTO citas (usuario_id, mascota_id, fecha, descripcion, estatus_cobro) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [usuarioId, mascota_id, fecha, descripcion, estatus_cobro || 'pendiente_efectivo']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, fecha, descripcion } = req.body;
    const usuarioId = usuario_id;

    // Obtener la cita actual
    const citaActualQuery = await pool.query('SELECT fecha FROM citas WHERE id = $1 AND usuario_id = $2', [id, usuarioId]);
    
    if (citaActualQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada.' });
    }

    const citaActual = citaActualQuery.rows[0];
    const fechaOriginal = new Date(citaActual.fecha);
    const ahora = new Date();

    // Validar edición 24 horas antes
    const diferenciaHoras = (fechaOriginal - ahora) / (1000 * 60 * 60);
    if (diferenciaHoras < 24) {
      return res.status(400).json({ error: 'No se puede editar una cita con menos de 24 horas de anticipación.' });
    }

    // Si se pasa una nueva fecha, validamos los 2 días de anticipación
    let nuevaFecha = fechaOriginal;
    if (fecha) {
      const parsedFecha = new Date(fecha);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 2);
      minDate.setHours(0, 0, 0, 0);
      
      if (parsedFecha < minDate) {
         return res.status(400).json({ error: 'La nueva fecha debe ser al menos con 2 días de anticipación.' });
      }
      nuevaFecha = parsedFecha;
    }

    const updateQuery = `
      UPDATE citas 
      SET fecha = COALESCE($1, fecha), descripcion = COALESCE($2, descripcion)
      WHERE id = $3 AND usuario_id = $4 
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [nuevaFecha, descripcion, id, usuarioId]);

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.query;
    const usuarioId = usuario_id;

    // Podríamos validar también las 24 horas para eliminar, pero no fue especificado. 
    // Lo dejaremos eliminar libremente o validaremos también las 24 hrs? Asumiremos libre por ahora.

    const { rowCount } = await pool.query('DELETE FROM citas WHERE id = $1 AND usuario_id = $2', [id, usuarioId]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada.' });
    }

    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const updateQuery = `
      UPDATE citas 
      SET estado = $1
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(updateQuery, [estado, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

