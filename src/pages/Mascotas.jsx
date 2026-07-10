import { useState, useEffect } from 'react';
import { useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import '../App.css';

function Mascotas() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [mascotas, setMascotas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'perro',
    raza: '',
    anos: '0',
    meses: '0',
    descripcion: ''
  });

  console.log("Renderizando componente Mascotas. Usuario:", user);
  console.log("Estado actual de mascotas:", mascotas);

  useEffect(() => {
    if (user) {
      console.log("Usuario detectado, llamando a fetchMascotas para ID:", user.id);
      fetchMascotas();
    } else {
      console.log("No hay usuario, no se llamará fetchMascotas");
    }
  }, [user]);

  const fetchMascotas = async () => {
    try {
      const endpoint = user.rol === 'empleado' 
        ? `${import.meta.env.VITE_API_URL}/api/mascotas` 
        : `${import.meta.env.VITE_API_URL}/api/mascotas/usuario/${user.id}`;
        
      console.log(`Haciendo fetch a: ${endpoint}`);
      const response = await fetch(endpoint, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      if (response.ok) {
        setMascotas(data.mascotas || []);
      } else {
        console.error('Error fetching mascotas:', data.error);
        setError(`Error del servidor: ${data.error}`);
      }
    } catch (err) {
      console.error('Network error en fetchMascotas:', err);
      setError(`Error de red: ${err.message}`);
    }
  };

  if (!user) {
    console.log("Redirigiendo a /login porque no hay usuario");
    return <Navigate to="/login" replace />;
  }

  const handleAddClick = () => {
    if (mascotas.length >= 5) {
      alert('Has alcanzado el límite máximo de 5 mascotas.');
      return;
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/mascotas`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMascotas([...mascotas, data.mascota]);
        setShowForm(false);
        setFormData({ nombre: '', tipo: 'perro', raza: '', anos: '0', meses: '0', descripcion: '' });
      } else {
        setError(data.error || 'Hubo un error al registrar la mascota');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/dashboard" state={{ user }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver</Link>
        </div>
        <div className="header-center">
          <h1>Vetcare - {user.rol === 'empleado' ? 'Clientes (Todas las Mascotas)' : 'Mis Mascotas'}</h1>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/configuracion" state={{ user }}>
            <img src="/images/user.png" alt="Configuración" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} title="Configuración de Perfil" />
          </Link>
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#333' }}>
            {user.rol === 'empleado' ? `Mascotas Registradas (${mascotas.length})` : `Mis Mascotas (${mascotas.length}/5)`}
          </h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user.rol === 'empleado' && (
              <div style={{ display: 'flex', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '0.25rem' }}>
                <button 
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                    color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: viewMode === 'grid' ? 'bold' : 'normal',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Cuadrícula
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                    color: viewMode === 'list' ? '#0f172a' : '#64748b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: viewMode === 'list' ? 'bold' : 'normal',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  Lista
                </button>
              </div>
            )}

            {user.rol !== 'empleado' && (
              <button 
                onClick={handleAddClick}
                disabled={mascotas.length >= 5}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: mascotas.length >= 5 ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: mascotas.length >= 5 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                + Agregar mascota
              </button>
            )}
          </div>
        </div>
        
        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Registrar nueva mascota</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Nombre:</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Tipo:</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="conejo">Conejo</option>
                    <option value="canario">Canario</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label>Raza:</label>
                  <input type="text" name="raza" value={formData.raza} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Años:</label>
                    <select name="anos" value={formData.anos} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                      {[...Array(21).keys()].map(i => <option key={`a${i}`} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Meses:</label>
                    <select name="meses" value={formData.meses} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                      {[...Array(13).keys()].map(i => <option key={`m${i}`} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label>Descripción:</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}></textarea>
              </div>

              <div>
                <label>Imagen de la Mascota:</label>
                <div style={{ marginTop: '0.5rem' }}>
                  <button type="button" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => alert('Función de subida de imagen en desarrollo. Por ahora se usa la imagen por defecto.')}>
                    Subir Imagen
                  </button>
                  <span style={{ marginLeft: '1rem', color: '#666' }}>Se usará imagen por defecto (huella.png)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ padding: '0.8rem 2rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Guardar Mascota</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.8rem 2rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {mascotas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '2px dashed #ccc' }}>
            <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {user.rol === 'empleado' ? 'No hay mascotas registradas en el sistema.' : 'Aún no tienes mascotas registradas.'}
            </p>
            {user.rol !== 'empleado' && (
              <button 
                onClick={handleAddClick}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'
                }}
              >
                + Agregar tu primera mascota aquí
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr', 
            gap: '2rem' 
          }}>
            {mascotas.map(mascota => (
              <div 
                key={mascota.id} 
                onClick={() => navigate(`/mascotas/${mascota.id}`, { state: { user } })}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  padding: '1.5rem',
                  textAlign: viewMode === 'grid' ? 'center' : 'left',
                  display: viewMode === 'grid' ? 'block' : 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  cursor: 'pointer',
                  transition: 'transform 0.3s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img src="/images/huella.png" alt="Mascota" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: viewMode === 'grid' ? '1rem' : '0' }} />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                    {mascota.nombre}
                    {mascota.activo === false && (
                      <span style={{ backgroundColor: '#dc3545', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '10px', verticalAlign: 'middle' }}>Inactiva</span>
                    )}
                  </h3>
                  <p style={{ margin: 0, color: '#666', textTransform: 'capitalize' }}>{mascota.tipo}</p>
                </div>
                
                {viewMode === 'list' && (
                  <div style={{ textAlign: 'right', color: '#94a3b8' }}>
                    <p style={{ margin: 0 }}>Edad: {mascota.edad}</p>
                    <p style={{ margin: 0 }}>Raza: {mascota.raza || 'N/A'}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Tarjeta para agregar nueva mascota si no se ha alcanzado el límite */}
            {user.rol !== 'empleado' && mascotas.length < 5 && (
              <div 
                onClick={handleAddClick}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '200px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                <div style={{ fontSize: '4rem', color: '#cbd5e1', lineHeight: '1' }}>+</div>
                <h3 style={{ margin: '1rem 0 0 0', color: '#94a3b8' }}>Agregar Mascota</h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Mascotas;
