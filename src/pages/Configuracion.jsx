import { useState, useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import '../App.css';

function Configuracion() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasenaNueva: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${currentUser.id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          nombres: data.nombres || '',
          apellidos: data.apellidos || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          codigoPostal: data.codigo_postal || ''
        }));
      } else {
        setMensaje({ texto: 'Error al cargar los datos del usuario', tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (formData.contrasenaNueva) {
      if (formData.contrasenaNueva !== formData.confirmarContrasenaNueva) {
        setMensaje({ texto: 'Las contraseñas nuevas no coinciden', tipo: 'error' });
        return;
      }
      if (!formData.contrasenaActual) {
        setMensaje({ texto: 'Debes ingresar tu contraseña actual para cambiarla', tipo: 'error' });
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
          codigoPostal: formData.codigoPostal,
          contrasenaActual: formData.contrasenaActual,
          contrasenaNueva: formData.contrasenaNueva
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ texto: 'Configuración guardada exitosamente.', tipo: 'exito' });
        
        setCurrentUser(prev => ({
          ...prev,
          nombres: formData.nombres,
          apellidos: formData.apellidos
        }));

        setFormData(prev => ({
          ...prev,
          contrasenaActual: '',
          contrasenaNueva: '',
          confirmarContrasenaNueva: ''
        }));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setMensaje({ texto: data.error || 'Error al guardar los cambios', tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/dashboard" state={{ user: currentUser }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver al Dashboard</Link>
        </div>
        <div className="header-center">
          <h1>Configuración de Perfil</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ padding: '2rem', maxWidth: '800px', margin: '76px auto 0', width: '100%' }}>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando información...</div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            
            {mensaje.texto && (
              <div style={{ 
                backgroundColor: mensaje.tipo === 'error' ? '#fee' : '#d4edda', 
                color: mensaje.tipo === 'error' ? 'red' : '#155724', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <h3 style={{ borderBottom: '2px solid #f1f1f1', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Datos Personales</h3>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombres:</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Apellidos:</label>
                  <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Correo Electrónico (No modificable):</label>
                <input type="email" name="correo" value={formData.correo} readOnly
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#e9ecef', color: '#6c757d', cursor: 'not-allowed' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Teléfono:</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Código Postal:</label>
                  <input type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Dirección Completa:</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <h3 style={{ borderBottom: '2px solid #f1f1f1', paddingBottom: '0.5rem', margin: '2rem 0 1rem 0' }}>Cambiar Contraseña (Opcional)</h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contraseña Actual:</label>
                <input type="password" name="contrasenaActual" value={formData.contrasenaActual} onChange={handleChange} placeholder="Deja en blanco si no deseas cambiarla"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nueva Contraseña:</label>
                  <input type="password" name="contrasenaNueva" value={formData.contrasenaNueva} onChange={handleChange}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirmar Nueva Contraseña:</label>
                  <input type="password" name="confirmarContrasenaNueva" value={formData.confirmarContrasenaNueva} onChange={handleChange}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}>
                Guardar Cambios
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default Configuracion;
