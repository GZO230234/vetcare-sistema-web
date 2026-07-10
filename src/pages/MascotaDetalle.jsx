import { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import '../App.css';

function MascotaDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const user = location.state?.user;

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchMascota();
    }
  }, [user, id]);

  const fetchMascota = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/mascotas/${id}`);
      const data = await response.json();
      if (response.ok) {
        setMascota(data.mascota);
      } else {
        setError(data.error || 'Error al cargar la mascota');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/mascotas" state={{ user }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver</Link>
        </div>
        <div className="header-center">
          <h1>Detalles de la Mascota</h1>
        </div>
        <div className="header-right">
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        padding: '2rem', 
        gap: '2rem',
        minHeight: '80vh',
        backgroundColor: '#f8fafc',
        marginTop: '76px'
      }}>
        
        {loading ? (
          <p>Cargando detalles...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : mascota ? (
          <>
            {/* Left Column: Pet Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1', maxWidth: '300px' }}>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <img src="/images/huella.png" alt="Mascota" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                  <h2 style={{ margin: '1rem 0 0 0', color: '#2c3e50', fontSize: '1.5rem' }}>{mascota.nombre}</h2>
                  <p style={{ margin: 0, color: '#64748b', textTransform: 'capitalize', fontSize: '1.1rem' }}>{mascota.tipo}</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Raza</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: '500' }}>{mascota.raza || 'No especificada'}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Edad</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: '500' }}>{mascota.edad}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Descripción</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155', lineHeight: '1.5' }}>{mascota.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info Card (Visible para empleados) */}
              {user.rol === 'empleado' && mascota.dueno_nombres && (
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    👤 Información del Dueño
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: 'bold' }}>
                        {mascota.dueno_nombres} {mascota.dueno_apellidos}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>✉️ {mascota.dueno_correo}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>📞 {mascota.dueno_telefono}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column: Expediente */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📋 Expediente Médico
                </h2>
                <div style={{ backgroundColor: '#f1f5f9', padding: '3rem', borderRadius: '12px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>[Próximamente: Historial clínico, vacunas, citas, etc.]</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Mascota no encontrada.</p>
        )}
      </main>
    </div>
  );
}

export default MascotaDetalle;
