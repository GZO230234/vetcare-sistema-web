import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Auth.css';

function VerificarCorreo() {
  const { token } = useParams();
  const [estado, setEstado] = useState('verificando'); // 'verificando', 'exito', 'error'
  const [mensaje, setMensaje] = useState('Verificando tu cuenta, por favor espera...');
  const verificandoRef = useRef(false);

  useEffect(() => {
    if (verificandoRef.current) return;
    verificandoRef.current = true;

    const verificar = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          setEstado('exito');
          setMensaje(data.message || 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.');
        } else {
          setEstado('error');
          setMensaje(data.error || 'El enlace de validación es inválido o ya expiró.');
        }
      } catch (error) {
        setEstado('error');
        setMensaje('Error de conexión con el servidor.');
      }
    };

    verificar();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ textAlign: 'center' }}>
        <h2>Verificación de Cuenta</h2>
        
        <div style={{ margin: '2rem 0' }}>
          {estado === 'verificando' && (
            <div style={{ color: '#007BFF', fontSize: '1.1rem' }}>⏳ {mensaje}</div>
          )}
          {estado === 'exito' && (
            <div style={{ color: '#28a745', fontSize: '1.2rem', fontWeight: 'bold' }}>✅ {mensaje}</div>
          )}
          {estado === 'error' && (
            <div style={{ color: '#dc3545', fontSize: '1.1rem' }}>❌ {mensaje}</div>
          )}
        </div>

        {estado !== 'verificando' && (
          <Link to="/login" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Ir a Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}

export default VerificarCorreo;
