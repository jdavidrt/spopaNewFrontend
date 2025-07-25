import React, { useState } from 'react';

// Datos de prueba
const initialOffers = [
  {
    id: 1,
    nombre_empresa: 'Tech Solutions',
    sector_empresa: 'Tecnología',
    correo_electronico: 'contacto@techsolutions.com',
    programas_academicos_buscados: ['Ingeniería de Sistemas', 'Ingeniería Electrónica'],
    titulo: 'Pasantía en Desarrollo Web',
    cargo: 'Desarrollador Frontend',
    horario: 'Lunes a Viernes, 8am-5pm',
    modalidad: 'Remoto',
    tipo: 'Tiempo completo',
    fecha_cierre: '2025-06-30',
    fecha_inicio: '2025-07-15',
    vacantes: 2,
    ciudad: 'Bogotá',
    descripcion: 'Desarrollar nuevas funcionalidades en React.',
    perfil_aspirante: 'Estudiante de últimos semestres, con conocimientos en React.',
    observaciones: 'Se proporciona equipo de trabajo.'
  }
];

function OfferForm({ offer, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    offer || {
      nombre_empresa: '',
      sector_empresa: '',
      correo_electronico: '',
      programas_academicos_buscados: '',
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
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      programas_academicos_buscados: formData.programas_academicos_buscados.split(',').map(s => s.trim())
    };
    onSave(finalData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20, padding: 20, border: '1px solid #ccc' }}>
      <h3>{offer ? 'Editar Oferta' : 'Nueva Oferta'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.keys(formData).map((key) => (
          <label key={key}>
            {key.replace(/_/g, ' ')}:
            <input
              type={key.includes('fecha') ? 'date' : 'text'}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required={key !== 'observaciones'}
              style={{ width: '100%' }}
            />
          </label>
        ))}
        <div>
          <button type="submit">Guardar</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: 10 }}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

function OfferTable({ offers, onEdit, onDelete }) {
  return (
    <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 20 }}>
      <thead>
        <tr>
          <th>Título</th>
          <th>Empresa</th>
          <th>Ciudad</th>
          <th>Modalidad</th>
          <th>Vacantes</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.titulo}</td>
            <td>{offer.nombre_empresa}</td>
            <td>{offer.ciudad}</td>
            <td>{offer.modalidad}</td>
            <td>{offer.vacantes}</td>
            <td>
              <button onClick={() => onEdit(offer)}>Editar</button>
              <button onClick={() => onDelete(offer.id)} style={{ marginLeft: 5 }}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BusinessPortal() {
  const [offers, setOffers] = useState(initialOffers);
  const [editingOffer, setEditingOffer] = useState(null);

  const handleSave = (offer) => {
    if (editingOffer) {
      // Editar existente
      setOffers((prev) =>
        prev.map((o) => (o.id === editingOffer.id ? { ...offer, id: editingOffer.id } : o))
      );
    } else {
      // Nueva oferta
      const newOffer = { ...offer, id: Date.now() };
      setOffers((prev) => [...prev, newOffer]);
    }
    setEditingOffer(null);
  };

  const handleDelete = (id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Portal de Ofertas de Pasantía</h2>
      <button onClick={() => setEditingOffer({})}>Crear nueva oferta</button>
      <OfferTable offers={offers} onEdit={setEditingOffer} onDelete={handleDelete} />
      {editingOffer !== null && (
        <OfferForm
          offer={Object.keys(editingOffer).length ? editingOffer : null}
          onSave={handleSave}
          onCancel={() => setEditingOffer(null)}
        />
      )}
    </div>
  );
}
