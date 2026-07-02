import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recuerdame, setRecuerdame] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Intento de login:', { correo, contrasena, recuerdame });
    // Aquí se llamará al API del backend
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Iniciar Sesión en Vetcare</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required 
            />
          </div>
          <div className="form-group-checkbox">
            <input 
              type="checkbox" 
              id="recuerdame"
              checked={recuerdame}
              onChange={(e) => setRecuerdame(e.target.checked)}
            />
            <label htmlFor="recuerdame">Recuérdame</label>
          </div>
          <button type="submit" className="auth-btn">Iniciar Sesión</button>
        </form>
        <div className="auth-footer">
          <p>¿No tienes una cuenta?</p>
          <Link to="/register" className="auth-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
