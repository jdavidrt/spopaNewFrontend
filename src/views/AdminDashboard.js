import React, { useState, useEffect } from 'react';
import { useSession } from '../utils/sessionManager';

// --- 🔧 Cambiar la URL para usar el API Gateway ---
const API_BASE_URL = 'http://3.138.110.228:8000/api';

// Componente de formulario genérico para añadir/editar ofertas
// Ahora 'offer' puede ser null (para creación) o un objeto de oferta (para edición)
function OfferForm({ offer, onSave, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (offer) { // Si 'offer' tiene datos (modo edición)
      setFormData({
        ...offer,
        // Convierte el array de programas_academicos_buscados a string para el input de texto
        programas_academicos_buscados: Array.isArray(offer.programas_academicos_buscados)
          ? offer.programas_academicos_buscados.join(', ')
          : ''
      });
    } else { // Si 'offer' es null o undefined (modo creación)
      setFormData({
        nombre_empresa: '',
        sector_empresa: '',
        correo_electronico: '',
        programas_academicos_buscados: '', // Se manejará como string separado por comas para el input
        titulo: '',
        cargo: '',
        horario: '',
        modalidad: '',
        tipo: '',
        fecha_cierre: '',
        fecha_inicio: '',
        vacantes: 1,
        ciudad: '',
        descripcion: '',
        perfil_aspirante: '',
        observaciones: ''
      });
    }
  }, [offer]); // Dependencia del 'offer' prop: se re-ejecuta si 'offer' cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      programas_academicos_buscados: formData.programas_academicos_buscados
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    };
    onSave(finalData); // Llama a la función onSave pasada desde el padre
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 8,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3>{offer ? 'Editar Oferta' : 'Nueva Oferta'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(formData).map((key) => {
            // Excluye los campos '_id' y 'id' del renderizado
            if (key === '_id' || key === 'id') return null;

            return (
              <label key={key}>
                {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}:
                {key === 'descripcion' || key === 'perfil_aspirante' || key === 'observaciones' ? (
                  <textarea
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={key !== 'observaciones'}
                    style={{ width: '100%', minHeight: 80 }}
                  />
                ) : (
                  <input
                    type={key.includes('fecha') ? 'date' : (key === 'vacantes' ? 'number' : 'text')}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={key !== 'observaciones'}
                    style={{ width: '100%' }}
                  />
                )}
              </label>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
              {offer ? 'Guardar Cambios' : 'Crear Oferta'}
            </button>
            <button type="button" onClick={onCancel} style={{ padding: '10px 20px', marginLeft: 10, backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Componente para la tabla de estudiantes (solo admins)
function StudentTable({ students }) {
  return (
    <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={{ padding: 10, textAlign: 'left' }}>Nombre</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Paso actual (0/5)</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Empresa asignada</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 10 }}>{student.nombre}</td>
            <td style={{ padding: 10 }}>{student.paso_actual} / 5</td>
            <td style={{ padding: 10 }}>{student.empresa || 'Sin asignar'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Componente para la tabla de ofertas
function OfferTable({ offers, onEdit, onDelete, isStudent, appliedOffers, onApply }) {
  return (
    <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={{ padding: 10, textAlign: 'left' }}>Título</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Empresa</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Ciudad</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Modalidad</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Vacantes</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer._id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 10 }}>{offer.titulo}</td>
            <td style={{ padding: 10 }}>{offer.nombre_empresa}</td>
            <td style={{ padding: 10 }}>{offer.ciudad}</td>
            <td style={{ padding: 10 }}>{offer.modalidad}</td>
            <td style={{ padding: 10 }}>{offer.vacantes}</td>
            <td style={{ padding: 10 }}>
              {isStudent ? (
                appliedOffers.includes(offer._id) ? (
                  <span style={{ color: 'green', fontWeight: 'bold' }}>Aplicado</span>
                ) : (
                  <button
                    onClick={() => onApply(offer._id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer'
                    }}
                  >
                    Aplicar
                  </button>
                )
              ) : (
                <>
                  <button onClick={() => onEdit(offer)} style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => onDelete(offer._id)} style={{ padding: '8px 12px', marginLeft: 5, backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Componente principal del Panel de Administración
export default function AdminDashboard() {
  const { hasRole, getCurrentUserId } = useSession();
  const isStudent = hasRole && hasRole("Estudiante");

  const [students] = useState([
    { id: 's1', nombre: 'Juan Pérez', paso_actual: 3, empresa: 'Tech Solutions' },
    { id: 's2', nombre: 'Maria García', paso_actual: 1, empresa: '' },
    { id: 's3', nombre: 'Pedro López', paso_actual: 5, empresa: 'Global Corp' },
  ]);

  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // --- Aplicaciones del estudiante ---
  const [appliedOffers, setAppliedOffers] = useState([]);

  // Fetch offers from API when component mounts
  useEffect(() => {
    fetch(`${API_BASE_URL}/offers`)
      .then(res => res.json())
      .then(data => setOffers(data))
      .catch(() => setOffers([]));
  }, []);

  // Cargar aplicaciones desde localStorage al iniciar
  useEffect(() => {
    if (isStudent && getCurrentUserId) {
      const userId = getCurrentUserId();
      const key = `appliedOffers_${userId}`;
      let saved = localStorage.getItem(key);
      if (!saved) {
        localStorage.setItem(key, JSON.stringify([]));
        saved = '[]';
      }
      setAppliedOffers(JSON.parse(saved)); // Now this is an array of IDs
    }
  }, [isStudent, getCurrentUserId]);

  // Guardar aplicaciones en localStorage cuando cambian
  useEffect(() => {
    if (isStudent && getCurrentUserId) {
      const userId = getCurrentUserId();
      localStorage.setItem(`appliedOffers_${userId}`, JSON.stringify(appliedOffers));
    }
  }, [appliedOffers, isStudent, getCurrentUserId]);

  // Función para aplicar a una oferta (guarda solo el ID)
  const handleApply = (offerId) => {
    if (!appliedOffers.includes(offerId)) {
      setAppliedOffers([...appliedOffers, offerId]);
    }
  };

  // Función unificada para guardar (crear o actualizar) una oferta (solo local)
  const handleSaveOffer = (offerData) => {
    if (offerData._id) {
      // Editar oferta existente
      setOffers((prev) =>
        prev.map((o) => (o._id === offerData._id ? { ...offerData } : o))
      );
    } else {
      // Crear nueva oferta
      const newOffer = {
        ...offerData,
        _id: 'o' + (offers.length + 1), // Genera un id simple
      };
      setOffers((prev) => [...prev, newOffer]);
    }
    setEditingOffer(null);
    setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    if (!id) {
      console.error('❌ Error: No se puede eliminar una oferta sin ID.');
      return;
    }
    if (!window.confirm('¿Está seguro de que desea eliminar esta oferta?')) {
      return;
    }
    setOffers((prev) => prev.filter((o) => o._id !== id)); // Filtra usando _id
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333' }}>Panel de Administrador</h2>

      {/* Solo admins ven estudiantes */}
      {!isStudent && (
        <>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginTop: 30 }}>Estudiantes Registrados</h3>
          <StudentTable students={students} />
        </>
      )}

      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginTop: 30 }}>Ofertas Laborales</h3>
      {/* Solo admins ven el botón de añadir */}
      {!isStudent && (
        <button onClick={() => setShowCreateForm(true)} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', marginBottom: 20 }}>
          Añadir nueva oferta
        </button>
      )}

      <OfferTable
        offers={offers}
        onEdit={(offer) => {
          setEditingOffer(offer);
          setShowCreateForm(false);
        }}
        onDelete={handleDelete}
        isStudent={isStudent}
        appliedOffers={appliedOffers} // Pass only IDs
        onApply={handleApply}
      />

      {/* Formulario para CREAR nueva oferta (aparece como modal) */}
      {!isStudent && showCreateForm && (
        <OfferForm
          offer={null} // Pasa null para indicar modo creación
          onSave={handleSaveOffer}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Formulario para EDITAR oferta existente (aparece como modal) */}
      {!isStudent && editingOffer && (
        <OfferForm
          offer={editingOffer} // Pasa la oferta existente para edición
          onSave={handleSaveOffer}
          onCancel={() => setEditingOffer(null)}
        />
      )}
    </div>
  );
}