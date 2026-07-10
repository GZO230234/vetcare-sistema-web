import { useState, useEffect } from 'react';
import { useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import '../App.css'; 

function Citas() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado para modal de edición
  const [editando, setEditando] = useState(null);
  const [editFormData, setEditFormData] = useState({ fecha_dia: '', fecha_hora: '', descripcion: '' });
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCitas();
    }
  }, [user]);

  const fetchCitas = async () => {
    try {
      const endpoint = user.rol === 'empleado' 
        ? `${import.meta.env.VITE_API_URL}/api/citas/todas`
        : `${import.meta.env.VITE_API_URL}/api/citas/usuario/${user.id}`;
      const response = await fetch(endpoint, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      if (!response.ok) {
        throw new Error('Error al cargar las citas');
      }
      const data = await response.json();
      setCitas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cita?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/${id}?usuario_id=${user.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        if (response.ok) {
          setCitas(citas.filter(cita => cita.id !== id));
        } else {
          const data = await response.json();
          alert(data.error || 'Error al eliminar');
        }
      } catch (err) {
        alert('Error de conexión');
      }
    }
  };

  const handleEstadoChange = async (id, nuevoEstado) => {
    if (nuevoEstado === 'no_asistio') {
      const confirmar = window.confirm("¿Estás seguro de marcar esta cita como 'No Asistió'? Esta acción no se puede revertir.");
      if (!confirmar) return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (response.ok) {
        fetchCitas();
      } else {
        alert('Error al cambiar el estado de la cita');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const abrirEdicion = (cita) => {
    const citaDate = new Date(cita.fecha);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(citaDate - tzoffset)).toISOString();
    
    const fecha_dia = localISOTime.slice(0, 10);
    const fecha_hora = localISOTime.slice(11, 16);

    setEditFormData({
      fecha_dia: fecha_dia,
      fecha_hora: fecha_hora,
      descripcion: cita.descripcion
    });
    setEditando(cita.id);
    setEditError(null);
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    try {
      const fechaComb = `${editFormData.fecha_dia}T${editFormData.fecha_hora}:00`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/${editando}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          fecha: fechaComb,
          descripcion: editFormData.descripcion
        })
      });
      
      if (response.ok) {
        setEditando(null);
        fetchCitas();
      } else {
        const data = await response.json();
        setEditError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setEditError('Error de conexión');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/dashboard" state={{ user }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver</Link>
        </div>
        <div className="header-center">
          <h1>Vetcare - Citas</h1>
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/configuracion" state={{ user }}>
            <img src="/images/user.png" alt="Configuración" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} title="Configuración de Perfil" />
          </Link>
          <Link to="/" className="login-btn" style={{ backgroundColor: '#f44336' }}>Cerrar Sesión</Link>
        </div>
      </header>

      <main className="vetcare-main" style={{ padding: '2rem', maxWidth: '1000px', margin: '76px auto 0', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#333' }}>Mis Citas</h2>
          {user?.rol !== 'empleado' && (
            <Link to="/citas/nueva" state={{ user }} style={{
              padding: '0.8rem 1.5rem',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#007BFF'}>
              + Nueva cita
            </Link>
          )}
        </div>
        
        {cargando ? (
          <p>Cargando citas...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : citas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '2px dashed #ccc' }}>
            <p style={{ color: '#666', fontSize: '1.2rem' }}>Aún no tienes citas agendadas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {citas.map(cita => (
              <div key={cita.id} style={{
                backgroundColor: (cita.estado === 'atendido' || cita.estado === 'no_asistio') ? '#e9ecef' : 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                borderLeft: cita.estado === 'atendido' ? '5px solid #6c757d' : (cita.estado === 'no_asistio' ? '5px solid #dc3545' : '5px solid #007BFF'),
                opacity: (cita.estado === 'atendido' || cita.estado === 'no_asistio') ? 0.7 : 1,
                filter: (cita.estado === 'atendido' || cita.estado === 'no_asistio') ? 'grayscale(50%)' : 'none'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  Cita para {cita.mascota_nombre} {user?.rol === 'empleado' && cita.cliente_nombre ? `- Cliente: ${cita.cliente_nombre} ${cita.cliente_apellido}` : ''}
                </h3>
                <p><strong>Fecha:</strong> {new Date(cita.fecha).toLocaleString()}</p>
                <p><strong>Síntomas/Descripción:</strong> {cita.descripcion}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span style={{
                    backgroundColor: cita.estado === 'atendido' ? '#e2e3e5' : (cita.estado === 'no_asistio' ? '#f8d7da' : '#cce5ff'),
                    color: cita.estado === 'atendido' ? '#383d41' : (cita.estado === 'no_asistio' ? '#721c24' : '#004085'),
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {cita.estado === 'atendido' ? 'Atendido' : (cita.estado === 'no_asistio' ? 'No Asistió' : 'En Espera')}
                  </span>
                </p>
                <p>
                  <strong>Pago:</strong>{' '}
                  <span style={{
                    backgroundColor: cita.estatus_cobro === 'pagada_paypal' ? '#d4edda' : (cita.estatus_cobro === 'pendiente_paypal' ? '#cce5ff' : '#fff3cd'),
                    color: cita.estatus_cobro === 'pagada_paypal' ? '#155724' : (cita.estatus_cobro === 'pendiente_paypal' ? '#004085' : '#856404'),
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {cita.estatus_cobro === 'pagada_paypal' ? 'Pagada (PayPal)' : (cita.estatus_cobro === 'pendiente_paypal' ? 'Pendiente (PayPal)' : 'Pendiente (Efectivo)')}
                  </span>
                </p>
                
                {user?.rol === 'empleado' && cita.estado === 'en espera' && (
                  <div style={{ marginTop: '15px' }}>
                    <button onClick={() => handleEstadoChange(cita.id, 'no_asistio')} style={{
                      width: '100%', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Marcar como No Asistió</button>
                  </div>
                )}

                {user?.rol === 'empleado' && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => navigate(`/citas/${cita.id}`, { state: { user } })} style={{
                      width: '100%', backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Ver Detalles Completos</button>
                  </div>
                )}
                
                {user?.rol !== 'empleado' && cita.estado === 'en espera' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => abrirEdicion(cita)} style={{
                      flex: 1, backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer'
                    }}>Editar</button>
                    <button onClick={() => handleEliminar(cita.id)} style={{
                      flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer'
                    }}>Eliminar</button>
                  </div>
                )}
                
                {user?.rol !== 'empleado' && (cita.estado === 'atendido' || cita.estado === 'no_asistio') && (
                  <div style={{ marginTop: '15px' }}>
                    <p style={{ margin: 0, color: '#6c757d', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center' }}>
                      Cita completada y no modificable.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%'
          }}>
            <h3>Editar Cita</h3>
            {editError && <p style={{ color: 'red', backgroundColor: '#fee', padding: '10px', borderRadius: '4px' }}>{editError}</p>}
            <form onSubmit={handleEditarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Día:</label>
                <input 
                  type="date" 
                  value={editFormData.fecha_dia}
                  onChange={(e) => setEditFormData({...editFormData, fecha_dia: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Hora Exacta:</label>
                <select
                  value={editFormData.fecha_hora}
                  onChange={(e) => setEditFormData({...editFormData, fecha_hora: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  <option value="">Seleccione...</option>
                  {['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Descripción de síntomas:</label>
                <textarea 
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({...editFormData, descripcion: e.target.value})}
                  required
                  rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditando(null)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Citas;
