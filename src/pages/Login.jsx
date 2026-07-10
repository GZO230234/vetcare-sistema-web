import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recuerdame, setRecuerdame] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Hubo un error al iniciar sesión.');
      } else {
        localStorage.setItem('token', data.token);
        // Redirigir al dashboard pasando los datos del usuario
        navigate('/dashboard', { state: { user: data.user } });
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar al servidor.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '20px' }}>
          <Link to="/" style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>← Volver al inicio</Link>
        </div>
        <h2 style={{ marginTop: '20px' }}>Iniciar Sesión en Vetcare</h2>
        {error && <div className="error-message">{error}</div>}
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
