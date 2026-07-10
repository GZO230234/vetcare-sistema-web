import { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, Link, useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import '../App.css';

function CitaDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [cita, setCita] = useState(null);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado del formulario de diagnóstico
  const [diagFormData, setDiagFormData] = useState({
    titulo: '',
    descripcion: '',
    prescripcion: ''
  });
  const [diagSubmitting, setDiagSubmitting] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchCita();
      fetchDiagnosticos();
    }
  }, [user, id]);

  const fetchCita = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/completa/${id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      const data = await response.json();
      if (response.ok) {
        setCita(data);
      } else {
        setError(data.error || 'Error al cargar los detalles de la cita');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosticos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnosticos/cita/${id}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
      const data = await response.json();
      if (response.ok) {
        setDiagnosticos(data);
      }
    } catch (err) {
      console.error('Error al cargar diagnósticos:', err);
    }
  };

  const handleDiagnosticoSubmit = async (e) => {
    e.preventDefault();
    
    const confirmar = window.confirm("La cita se marcará como atendida, ¿continuar?");
    if (!confirmar) return;

    setDiagSubmitting(true);
    
    const encargadoNombre = `${user.nombres} ${user.apellidos}`;

    try {
      // 1. Crear Diagnóstico
      const diagRes = await fetch(`${import.meta.env.VITE_API_URL}/api/diagnosticos`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascota_id: cita.mascota_id,
          cita_id: cita.id,
          encargado_id: user.id,
          encargado_nombre: encargadoNombre,
          titulo: diagFormData.titulo,
          descripcion: diagFormData.descripcion,
          prescripcion: diagFormData.prescripcion
        })
      });

      if (!diagRes.ok) {
        throw new Error('Error al guardar el diagnóstico');
      }

      // 2. Cambiar estado de la cita a 'atendido'
      const estadoRes = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/${cita.id}/estado`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'atendido' })
      });

      if (!estadoRes.ok) {
        throw new Error('Error al actualizar el estado de la cita');
      }

      // Recargar datos
      setDiagFormData({ titulo: '', descripcion: '', prescripcion: '' });
      fetchCita();
      fetchDiagnosticos();
      alert('Diagnóstico guardado y cita marcada como atendida exitosamente.');

    } catch (err) {
      alert(err.message || 'Error de conexión');
    } finally {
      setDiagSubmitting(false);
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citas/${id}/cobro`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus_cobro: 'pagada_paypal' })
      });

      if (res.ok) {
        alert('Pago procesado correctamente. ¡Gracias!');
        fetchCita();
      } else {
        alert('Error al registrar el pago en nuestro sistema.');
      }
    } catch (err) {
      console.error('Error al capturar el pago:', err);
      alert('Hubo un problema al procesar el pago.');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="vetcare-container">
      <header className="vetcare-header">
        <div className="header-left">
           <Link to="/citas" state={{ user }} className="login-btn" style={{ backgroundColor: '#555' }}>Volver a Citas</Link>
        </div>
        <div className="header-center">
          <h1>Detalles de la Cita</h1>
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
        ) : cita ? (
          <>
            {/* Left Column: Info Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1', maxWidth: '350px' }}>
              
              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#007BFF', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #007BFF', paddingBottom: '5px' }}>
                  📅 Información de la Cita
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Fecha y Hora</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155', fontWeight: '500' }}>{new Date(cita.fecha).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Estado</h4>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: cita.estado === 'atendido' ? '#28a745' : '#ffc107', textTransform: 'capitalize' }}>
                      {cita.estado}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Motivo / Síntomas</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>{cita.descripcion}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Pago</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>
                      {cita.estatus_cobro === 'pagada_paypal' ? 'Pagada (PayPal)' : 
                       cita.estatus_cobro === 'pendiente_paypal' ? 'Pendiente (PayPal)' : 'Pendiente (Efectivo)'}
                    </p>
                  </div>
                </div>

                {user.rol === 'cliente' && cita.estatus_cobro === 'pendiente_paypal' && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <PayPalButtons 
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            description: `Cita Veterinaria - ${cita.mascota_nombre}`,
                            amount: { value: '500.00' } // Costo fijo de ejemplo
                          }]
                        });
                      }}
                      onApprove={handlePayPalApprove}
                    />
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#fd7e14', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #fd7e14', paddingBottom: '5px' }}>
                  🐾 Información de la Mascota
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.2rem', color: '#334155', fontWeight: 'bold' }}>{cita.mascota_nombre}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', textTransform: 'capitalize' }}>{cita.mascota_tipo} • {cita.mascota_raza || 'Raza no especificada'}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Edad</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>{cita.mascota_edad}</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Notas</h4>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>{cita.mascota_descripcion || 'Ninguna'}</p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#28a745', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  👤 Información del Dueño
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#334155', fontWeight: 'bold' }}>{cita.cliente_nombre} {cita.cliente_apellido}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>✉️ {cita.cliente_correo}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>📞 {cita.cliente_telefono}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>📍 {cita.cliente_direccion || 'No registrada'}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Diagnósticos */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Formulario de Nuevo Diagnóstico (Solo si es empleado y la cita no está atendida) */}
              {user.rol === 'empleado' && cita.estado === 'en espera' && (
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', borderTop: '5px solid #17a2b8', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ margin: '0 0 1rem 0', color: '#17a2b8', fontSize: '1.5rem' }}>Añadir Diagnóstico Clínico</h2>
                  <form onSubmit={handleDiagnosticoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Título del Diagnóstico:</label>
                        <input 
                          type="text" 
                          required
                          value={diagFormData.titulo}
                          onChange={e => setDiagFormData({...diagFormData, titulo: e.target.value})}
                          placeholder="Ej. Infección del oído"
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Veterinario Encargado:</label>
                        <input 
                          type="text" 
                          disabled
                          value={`${user.nombres} ${user.apellidos}`}
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#e9ecef', color: '#495057' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descripción (Observaciones):</label>
                      <textarea 
                        required
                        rows="4"
                        value={diagFormData.descripcion}
                        onChange={e => setDiagFormData({...diagFormData, descripcion: e.target.value})}
                        placeholder="Detalles de la exploración, síntomas observados, etc."
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Prescripción / Cuidados Recomendados:</label>
                      <textarea 
                        rows="3"
                        value={diagFormData.prescripcion}
                        onChange={e => setDiagFormData({...diagFormData, prescripcion: e.target.value})}
                        placeholder="Medicamentos, dosis y recomendaciones a seguir en casa..."
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={diagSubmitting}
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: diagSubmitting ? 'not-allowed' : 'pointer',
                        opacity: diagSubmitting ? 0.7 : 1
                      }}
                    >
                      {diagSubmitting ? 'Guardando...' : 'Guardar Diagnóstico y Atender Cita'}
                    </button>
                  </form>
                </div>
              )}

              {/* Lista de Diagnósticos */}
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', flex: 1 }}>
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🩺 Diagnóstico de la Cita
                </h2>
                
                {diagnosticos.length === 0 ? (
                  <div style={{ backgroundColor: '#f1f5f9', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>Aún no hay diagnósticos registrados para esta cita.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {diagnosticos.map(diag => (
                      <div key={diag.id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.3rem' }}>{diag.titulo}</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Atendido por: <strong>{diag.encargado_nombre}</strong></p>
                          </div>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>
                            {new Date(diag.fecha_creacion).toLocaleString()}
                          </span>
                        </div>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <h5 style={{ margin: '0 0 0.3rem 0', color: '#475569', fontSize: '1rem' }}>Descripción:</h5>
                          <p style={{ margin: 0, color: '#334155', whiteSpace: 'pre-wrap' }}>{diag.descripcion}</p>
                        </div>

                        {diag.prescripcion && (
                          <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0' }}>
                            <h5 style={{ margin: '0 0 0.3rem 0', color: '#065f46', fontSize: '1rem' }}>Prescripción / Cuidados:</h5>
                            <p style={{ margin: 0, color: '#047857', whiteSpace: 'pre-wrap' }}>{diag.prescripcion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <p>No se pudo cargar la información de la cita.</p>
        )}
      </main>
    </div>
  );
}

export default CitaDetalle;
