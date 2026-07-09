import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function RegisterEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    // 10 caracteres, 1 mayúscula, 1 número, 1 símbolo
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!validatePassword(formData.contrasena)) {
      setError('La contraseña debe tener al menos 10 caracteres, incluir 1 letra mayúscula, 1 número y 1 símbolo.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          telefono: formData.telefono,
          direccion: formData.direccion,
          codigoPostal: formData.codigoPostal,
          contrasena: formData.contrasena
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Hubo un error al registrarse.');
      } else {
        alert('Registro de empleado exitoso. ¡Ahora puedes iniciar sesión!');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar al servidor.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <h2>Registro de Empleado</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombres</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Dirección Completa</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="auth-btn">Registrarse</button>
        </form>
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta?</p>
          <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterEmployee;
