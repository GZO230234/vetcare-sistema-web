const pool = require('../db');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  const { nombres, apellidos, correo, telefono, direccion, codigoPostal, contrasena } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExist = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

    // Insertar el nuevo usuario
    // Suponemos que por defecto el registro por la web es como 'cliente'
    const newUser = await pool.query(
      `INSERT INTO usuarios (correo, contrasena_hash, nombres, apellidos, telefono, direccion, codigo_postal, rol, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'cliente', NOW()) RETURNING id, correo, nombres, rol`,
      [correo, contrasenaHash, nombres, apellidos, telefono, direccion, codigoPostal]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar registrar.' });
  }
};

const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar usuario por correo
    const userResult = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Login exitoso
    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        correo: user.correo,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor.' });
  }
};

const registerEmployee = async (req, res) => {
  const { nombres, apellidos, correo, telefono, direccion, codigoPostal, contrasena } = req.body;

  try {
    const userExist = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const saltRounds = 10;
    const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO usuarios (correo, contrasena_hash, nombres, apellidos, telefono, direccion, codigo_postal, rol, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'empleado', NOW()) RETURNING id, correo, nombres, rol`,
      [correo, contrasenaHash, nombres, apellidos, telefono, direccion, codigoPostal]
    );

    res.status(201).json({
      message: 'Empleado registrado exitosamente',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Error en el registro de empleado:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar registrar.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerEmployee
};
