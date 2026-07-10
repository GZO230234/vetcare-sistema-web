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

  // Estado para modal de edición y detalles
  const [editando, setEditando] = useState(null);
  const [detallesCita, setDetallesCita] = useState(null);
  const [editFormData, setEditFormData] = useState({ fecha: '', descripcion: '' });
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCitas();
    }
  }, [user]);

  const fetchCitas = async () => {
    try {
      const endpoint = user.rol === 'empleado' 
        ? 'http://localhost:5000/api/citas/todas'
        : `http://localhost:5000/api/citas/usuario/${user.id}`;
      const response = await fetch(endpoint);
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
        const response = await fetch(`http://localhost:5000/api/citas/${id}?usuario_id=${user.id}`, {
          method: 'DELETE',
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
    try {
      const response = await fetch(`http://localhost:5000/api/citas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    const localISOTime = (new Date(citaDate - tzoffset)).toISOString().slice(0,16);

    setEditFormData({
      fecha: localISOTime,
      descripcion: cita.descripcion
    });
    setEditando(cita.id);
    setEditError(null);
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/citas/${editando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          fecha: editFormData.fecha,
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
        <div className="header-right">
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
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                borderLeft: '5px solid #007BFF'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  Cita para {cita.mascota_nombre} {user?.rol === 'empleado' && cita.cliente_nombre ? `- Cliente: ${cita.cliente_nombre} ${cita.cliente_apellido}` : ''}
                </h3>
                <p><strong>Fecha:</strong> {new Date(cita.fecha).toLocaleString()}</p>
                <p><strong>Síntomas/Descripción:</strong> {cita.descripcion}</p>
                <p>
                  <strong>Estado:</strong>{' '}
                  <span style={{
                    backgroundColor: cita.estado === 'atendido' ? '#e2e3e5' : '#cce5ff',
                    color: cita.estado === 'atendido' ? '#383d41' : '#004085',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {cita.estado === 'atendido' ? 'Atendido' : 'En Espera'}
                  </span>
                </p>
                <p>
                  <strong>Pago:</strong>{' '}
                  <span style={{
                    backgroundColor: cita.estatus_cobro === 'pagada_paypal' ? '#d4edda' : '#fff3cd',
                    color: cita.estatus_cobro === 'pagada_paypal' ? '#155724' : '#856404',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {cita.estatus_cobro === 'pagada_paypal' ? 'Pagada (PayPal)' : 'Pendiente (Efectivo)'}
                  </span>
                </p>
                
                {user?.rol === 'empleado' && cita.estado === 'en espera' && (
                  <div style={{ marginTop: '15px' }}>
                    <button onClick={() => handleEstadoChange(cita.id, 'atendido')} style={{
                      width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Marcar como Atendido</button>
                  </div>
                )}

                {user?.rol === 'empleado' && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => setDetallesCita(cita)} style={{
                      width: '100%', backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Ver Detalles Completos</button>
                  </div>
                )}
                
                {user?.rol !== 'empleado' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => abrirEdicion(cita)} style={{
                      flex: 1, backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer'
                    }}>Editar</button>
                    <button onClick={() => handleEliminar(cita.id)} style={{
                      flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer'
                    }}>Eliminar</button>
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
                <label style={{ display: 'block', marginBottom: '5px' }}>Nueva Fecha y Hora:</label>
                <input 
                  type="datetime-local" 
                  value={editFormData.fecha}
                  onChange={(e) => setEditFormData({...editFormData, fecha: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Descripción de síntomas:</label>
                <textarea 
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({...editFormData, descripcion: e.target.value})}
                  required
                  rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
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
      {/* Modal Detalles Cita */}
      {detallesCita && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }} onClick={() => setDetallesCita(null)}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Detalles de la Cita</h2>
              <button onClick={() => setDetallesCita(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h3 style={{ color: '#007BFF', borderBottom: '2px solid #007BFF', paddingBottom: '5px' }}>Información de la Cita</h3>
                <p><strong>Fecha y Hora:</strong> {new Date(detallesCita.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: detallesCita.estado === 'atendido' ? '#28a745' : '#ffc107' }}>{detallesCita.estado}</span></p>
                <p><strong>Motivo/Síntomas:</strong> {detallesCita.descripcion}</p>
                <p><strong>Pago:</strong> {detallesCita.estatus_cobro === 'pagada_paypal' ? 'Pagada (PayPal)' : 'Pendiente (Efectivo)'}</p>
              </section>

              <section>
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>Información del Cliente</h3>
                <p><strong>Nombre:</strong> {detallesCita.cliente_nombre} {detallesCita.cliente_apellido}</p>
                <p><strong>Correo:</strong> {detallesCita.cliente_correo}</p>
                <p><strong>Teléfono:</strong> {detallesCita.cliente_telefono}</p>
                <p><strong>Dirección:</strong> {detallesCita.cliente_direccion || 'No registrada'}</p>
              </section>

              <section>
                <h3 style={{ color: '#fd7e14', borderBottom: '2px solid #fd7e14', paddingBottom: '5px' }}>Información de la Mascota</h3>
                <p><strong>Nombre:</strong> {detallesCita.mascota_nombre}</p>
                <p><strong>Tipo:</strong> {detallesCita.mascota_tipo}</p>
                <p><strong>Raza:</strong> {detallesCita.mascota_raza || 'No especificada'}</p>
                <p><strong>Edad:</strong> {detallesCita.mascota_edad}</p>
                <p><strong>Notas de la mascota:</strong> {detallesCita.mascota_descripcion || 'Ninguna'}</p>
              </section>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setDetallesCita(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Citas;
