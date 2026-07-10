const pool = require('../db');

const registrarMascota = async (req, res) => {
  const { usuario_id, nombre, tipo, raza, anos, meses, descripcion } = req.body;

  try {
    // 1. Validar máximo de 5 mascotas por usuario
    const countQuery = await pool.query('SELECT COUNT(*) FROM mascotas WHERE usuario_id = $1', [usuario_id]);
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
    const mascotas = await pool.query('SELECT * FROM mascotas WHERE usuario_id = $1 ORDER BY fecha_registro ASC', [usuarioId]);
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

module.exports = {
  registrarMascota,
  obtenerMascotasPorUsuario,
  obtenerMascotaPorId,
  obtenerTodasLasMascotas
};
