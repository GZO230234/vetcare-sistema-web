const pool = require('../db');

const registrarMascota = async (req, res) => {
  const { usuario_id, nombre, tipo, raza, anos, meses, descripcion } = req.body;

  try {
    // 1. Validar máximo de 5 mascotas por usuario (solo mascotas activas)
    const countQuery = await pool.query('SELECT COUNT(*) FROM mascotas WHERE usuario_id = $1 AND activo = true', [usuario_id]);
    const mascotaCount = parseInt(countQuery.rows[0].count, 10);

    if (mascotaCount >= 5) {
      return res.status(400).json({ error: 'Has alcanzado el límite máximo de 5 mascotas registradas.' });
    }

    // 2. Construir el campo edad ("X años, Y meses")
    let edadParts = [];
    if (anos && anos !== '0') edadParts.push(`${anos} año${anos !== '1' ? 's' : ''}`);
    if (meses && meses !== '0') edadParts.push(`${meses} mes${meses !== '1' ? 'es' : ''}`);
    const edad = edadParts.length > 0 ? edadParts.join(', ') : '0 meses';

    // 3. Insertar la nueva mascota
    const newMascota = await pool.query(
      `INSERT INTO mascotas (usuario_id, nombre, tipo, raza, edad, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [usuario_id, nombre, tipo, raza, edad, descripcion]
    );

    res.status(201).json({
      message: 'Mascota registrada exitosamente',
      mascota: newMascota.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar mascota:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar registrar la mascota.' });
  }
};

const obtenerMascotasPorUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const mascotas = await pool.query('SELECT * FROM mascotas WHERE usuario_id = $1 AND activo = true ORDER BY fecha_registro ASC', [usuarioId]);
    res.status(200).json({
      mascotas: mascotas.rows
    });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar obtener las mascotas.' });
  }
};

const obtenerTodasLasMascotas = async (req, res) => {
  try {
    const mascotas = await pool.query('SELECT * FROM mascotas ORDER BY fecha_registro ASC');
    res.status(200).json({
      mascotas: mascotas.rows
    });
  } catch (error) {
    console.error('Error al obtener todas las mascotas:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar obtener las mascotas.' });
  }
};

const obtenerMascotaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const mascota = await pool.query(`
      SELECT m.*, u.nombres AS dueno_nombres, u.apellidos AS dueno_apellidos, u.correo AS dueno_correo, u.telefono AS dueno_telefono 
      FROM mascotas m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.id = $1
    `, [id]);
    if (mascota.rows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }
    res.status(200).json({
      mascota: mascota.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar obtener la mascota.' });
  }
};

const updateMascota = async (req, res) => {
  const { id } = req.params;
  const { anos, meses, descripcion } = req.body;

  try {
    let edadParts = [];
    if (anos && anos !== '0') edadParts.push(`${anos} año${anos !== '1' ? 's' : ''}`);
    if (meses && meses !== '0') edadParts.push(`${meses} mes${meses !== '1' ? 'es' : ''}`);
    const edad = edadParts.length > 0 ? edadParts.join(', ') : '0 meses';

    const result = await pool.query(
      'UPDATE mascotas SET edad = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [edad, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json({ message: 'Mascota actualizada correctamente', mascota: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteMascota = async (req, res) => {
  const { id } = req.params;

  try {
    const checkQuery = await pool.query('SELECT * FROM mascotas WHERE id = $1', [id]);
    if (checkQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const mascota = checkQuery.rows[0];

    // Si ya estaba inactiva, la intención del empleado es un borrado duro definitivo
    if (!mascota.activo) {
      await pool.query('DELETE FROM mascotas WHERE id = $1', [id]);
      return res.json({ message: 'Registro antiguo eliminado permanentemente.' });
    }

    const diagCount = await pool.query('SELECT COUNT(*) FROM diagnosticos WHERE mascota_id = $1', [id]);
    const citasCount = await pool.query("SELECT COUNT(*) FROM citas WHERE mascota_id = $1 AND estado = 'atendido'", [id]);
    
    const countDiagnosticos = parseInt(diagCount.rows[0].count, 10);
    const countCitasAtendidas = parseInt(citasCount.rows[0].count, 10);

    if (countDiagnosticos > 0 || countCitasAtendidas > 0) {
      await pool.query('UPDATE mascotas SET activo = false WHERE id = $1', [id]);
      return res.json({ message: 'Mascota eliminada lógicamente (se mantiene el historial clínico).' });
    } else {
      await pool.query('DELETE FROM mascotas WHERE id = $1', [id]);
      return res.json({ message: 'Mascota eliminada permanentemente de la base de datos.' });
    }
  } catch (error) {
    console.error('Error al borrar mascota:', error);
    res.status(500).json({ error: 'Error interno del servidor al borrar la mascota' });
  }
};

module.exports = {
  registrarMascota,
  obtenerMascotasPorUsuario,
  obtenerMascotaPorId,
  obtenerTodasLasMascotas,
  updateMascota,
  deleteMascota
};
