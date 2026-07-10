import { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import '../App.css';

function MascotaDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const user = location.state?.user;

  const navigate = useNavigate();
  const [mascota, setMascota] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [detalleDiagnostico, setDetalleDiagnostico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [editando, setEditando] = useState(false);
  const [editFormData, setEditFormData] = useState({ anos: '0', meses: '0', descripcion: '' });

  useEffect(() => {
    if (user && id) {
      fetchMascota();
      fetchDiagnosticos();
    }
  }, [user, id]);

  const fetchMascota = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/mascotas/${id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
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

  const fetchDiagnosticos = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/diagnosticos/mascota/${id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      if (response.ok) {
        const data = await response.json();
        setDiagnosticos(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const abrirEdicion = () => {
    let anos = '0';
    let meses = '0';
    if (mascota.edad) {
      const matchAnos = mascota.edad.match(/(\d+)\s*año/);
      const matchMeses = mascota.edad.match(/(\d+)\s*mes/);
      if (matchAnos) anos = matchAnos[1];
      if (matchMeses) meses = matchMeses[1];
    }
    setEditFormData({ anos, meses, descripcion: mascota.descripcion || '' });
    setEditando(true);
  };

  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/mascotas/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setEditando(false);
        fetchMascota();
      } else {
        alert('Error al actualizar la mascota');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleEliminar = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede revertir.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/mascotas/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok) {
          alert(data.message);
          navigate('/mascotas', { state: { user } });
        } else {
          alert(data.error || 'Error al eliminar');
        }
      } catch (err) {
        alert('Error de conexión');
      }
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
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/configuracion" state={{ user }}>
            <img src="/images/user.png" alt="Configuración" style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }} title="Configuración de Perfil" />
          </Link>
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

                {/* Botones de acción (Clientes) */}
                {user.id === mascota.usuario_id && mascota.activo && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={abrirEdicion} style={{
                      flex: 1, backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Editar</button>
                    <button onClick={handleEliminar} style={{
                      flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Borrar Mascota</button>
                  </div>
                )}
                
                {/* Botones de acción (Empleados) */}
                {user.rol === 'empleado' && !mascota.activo && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={handleEliminar} style={{
                      flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Eliminar Registro Viejo (Definitivo)</button>
                  </div>
                )}

                {/* Aviso para mascotas inactivas en vista de empleado */}
                {user.rol === 'empleado' && !mascota.activo && (
                   <p style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px' }}>Esta mascota fue borrada por el cliente (Inactiva).</p>
                )}
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
                  📋 Historial de Diagnósticos
                </h2>
                
                {diagnosticos.length === 0 ? (
                  <div style={{ backgroundColor: '#f1f5f9', padding: '3rem', borderRadius: '12px', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>Aún no hay diagnósticos registrados para esta mascota.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {diagnosticos.map(diag => (
                      <div 
                        key={diag.id} 
                        onClick={() => setDetalleDiagnostico(diag)}
                        style={{ 
                          padding: '1.5rem', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s, transform 0.1s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#eef2f6';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.2rem' }}>{diag.titulo}</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Atendido por: <strong>{diag.encargado_nombre}</strong></p>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>
                            {new Date(diag.fecha_creacion).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem' }}>
                            {diag.descripcion.length > 150 ? diag.descripcion.substring(0, 150) + '...' : diag.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Mascota no encontrada.</p>
        )}
      </main>

      {/* Modal Detalles Diagnóstico */}
      {detalleDiagnostico && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }} onClick={() => setDetalleDiagnostico(null)}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>{detalleDiagnostico.titulo}</h2>
              <button onClick={() => setDetalleDiagnostico(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Atendido por</h4>
                  <p style={{ margin: 0, color: '#1e293b', fontWeight: 'bold' }}>{detalleDiagnostico.encargado_nombre}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '0.9rem' }}>Fecha de Emisión</h4>
                  <p style={{ margin: 0, color: '#1e293b' }}>{new Date(detalleDiagnostico.fecha_creacion).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 style={{ color: '#007BFF', borderBottom: '2px solid #007BFF', paddingBottom: '5px', marginBottom: '10px' }}>Descripción Clínica</h3>
                <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{detalleDiagnostico.descripcion}</p>
              </div>

              {detalleDiagnostico.prescripcion && (
                <div>
                  <h3 style={{ color: '#10b981', borderBottom: '2px solid #10b981', paddingBottom: '5px', marginBottom: '10px' }}>Prescripción / Cuidados</h3>
                  <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ margin: 0, color: '#047857', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{detalleDiagnostico.prescripcion}</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={() => setDetalleDiagnostico(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Mascota */}
      {editando && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Editar Mascota</h3>
            <form onSubmit={handleEditarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Años:</label>
                  <select 
                    value={editFormData.anos} 
                    onChange={(e) => setEditFormData({...editFormData, anos: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  >
                    {[...Array(21).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Meses:</label>
                  <select 
                    value={editFormData.meses} 
                    onChange={(e) => setEditFormData({...editFormData, meses: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  >
                    {[...Array(12).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                <textarea 
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({...editFormData, descripcion: e.target.value})}
                  rows="4"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditando(false)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MascotaDetalle;
