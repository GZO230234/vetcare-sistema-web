const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { enviarCorreoValidacion } = require('../utils/mailer');

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

    const tokenValidacion = crypto.randomBytes(20).toString('hex');

    // Insertar el nuevo usuario
    // Suponemos que por defecto el registro por la web es como 'cliente'
    const newUser = await pool.query(
      `INSERT INTO usuarios (correo, contrasena_hash, nombres, apellidos, telefono, direccion, codigo_postal, rol, fecha_creacion, verificado, token_validacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'cliente', NOW(), false, $8) RETURNING id, correo, nombres, rol`,
      [correo, contrasenaHash, nombres, apellidos, telefono, direccion, codigoPostal, tokenValidacion]
    );

    // Enviar correo de validación de manera asíncrona (sin bloquear)
    enviarCorreoValidacion(correo, tokenValidacion);

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

    // Verificar si el correo está validado
    if (!user.verificado) {
      return res.status(403).json({ error: `Por favor valide su cuenta desde el enlace en su bandeja de entrada enviado a ${user.correo}` });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol, correo: user.correo },
      process.env.JWT_SECRET || 'vetcare_secreto_seguro_2026',
      { expiresIn: '24h' }
    );

    // Login exitoso
    res.status(200).json({
      message: 'Login exitoso',
      token,
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
    
    const tokenValidacion = crypto.randomBytes(20).toString('hex');

    const newUser = await pool.query(
      `INSERT INTO usuarios (correo, contrasena_hash, nombres, apellidos, telefono, direccion, codigo_postal, rol, fecha_creacion, verificado, token_validacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'empleado', NOW(), false, $8) RETURNING id, correo, nombres, rol`,
      [correo, contrasenaHash, nombres, apellidos, telefono, direccion, codigoPostal, tokenValidacion]
    );

    enviarCorreoValidacion(correo, tokenValidacion);

    res.status(201).json({
      message: 'Empleado registrado exitosamente',
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Error en el registro de empleado:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor al intentar registrar.' });
  }
};

const getUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT id, correo, nombres, apellidos, telefono, direccion, codigo_postal, rol FROM usuarios WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, telefono, direccion, codigoPostal, contrasenaActual, contrasenaNueva } = req.body;
    
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const user = userResult.rows[0];

    // Actualizar datos personales
    await pool.query(
      'UPDATE usuarios SET nombres = $1, apellidos = $2, telefono = $3, direccion = $4, codigo_postal = $5 WHERE id = $6',
      [nombres, apellidos, telefono, direccion, codigoPostal, id]
    );

    // Si intenta cambiar la contraseña
    if (contrasenaActual && contrasenaNueva) {
      const isMatch = await bcrypt.compare(contrasenaActual, user.contrasena_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }
      
      const saltRounds = 10;
      const contrasenaHash = await bcrypt.hash(contrasenaNueva, saltRounds);
      await pool.query('UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2', [contrasenaHash, id]);
    }

    res.json({ message: 'Datos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE token_validacion = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El enlace de validación es inválido o ya expiró.' });
    }
    
    await pool.query('UPDATE usuarios SET verificado = true, token_validacion = NULL WHERE id = $1', [result.rows[0].id]);
    res.json({ message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('Error al verificar correo:', err);
    res.status(500).json({ error: 'Error interno del servidor al verificar correo.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerEmployee,
  getUserData,
  updateUser,
  verifyEmail
};
