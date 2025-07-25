import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useSession } from '../utils/sessionManager';

// Change the URL to use the API Gateway
const API_BASE_URL = 'https://3.138.110.228:8000/api';

// Generic form component for adding/editing offers
function OfferForm({ offer, onSave, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (offer) { // Edit mode
      setFormData({
        ...offer,
        // Convert array of academic programs to string for text input
        programas_academicos_buscados: Array.isArray(offer.programas_academicos_buscados)
          ? offer.programas_academicos_buscados.join(', ')
          : ''
      });
    } else { // Create mode
      setFormData({
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
      });
    }
  }, [offer]);

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
    onSave(finalData);
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
        <h3>{offer ? 'Edit Offer' : 'New Offer'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(formData).map((key) => {
            // Exclude '_id' and 'id' fields from rendering
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
              {offer ? 'Save Changes' : 'Create Offer'}
            </button>
            <button type="button" onClick={onCancel} style={{ padding: '10px 20px', marginLeft: 10, backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Component for student table (admin only)
function StudentTable({ students }) {
  return (
    <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Current Step (0/5)</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Assigned Company</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: 10 }}>{student.nombre}</td>
            <td style={{ padding: 10 }}>{student.paso_actual} / 5</td>
            <td style={{ padding: 10 }}>{student.empresa || 'Not assigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Component for offers table
function OfferTable({ offers, onEdit, onDelete, isStudent, appliedOffers, onApply }) {
  return (
    <table border="1" cellPadding="8" style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={{ padding: 10, textAlign: 'left' }}>Title</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Company</th>
          <th style={{ padding: 10, textAlign: 'left' }}>City</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Modality</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Vacancies</th>
          <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
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
                  <span style={{
                    color: 'green',
                    fontWeight: 'bold',
                    padding: '8px 12px',
                    backgroundColor: '#d4edda',
                    borderRadius: 5,
                    border: '1px solid #c3e6cb'
                  }}>
                    Applied
                  </span>
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
                    Apply
                  </button>
                )
              ) : (
                <>
                  <button onClick={() => onEdit(offer)} style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(offer._id)} style={{ padding: '8px 12px', marginLeft: 5, backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                    Delete
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

// LocalStorage utility functions for managing applications
const applicationStorage = {
  // Get the localStorage key for a specific user
  getStorageKey: (userId) => `spopa_applied_offers_${userId}`,

  // Load applied offers for a user
  loadAppliedOffers: (userId) => {
    try {
      const key = applicationStorage.getStorageKey(userId);
      const data = localStorage.getItem(key);

      if (!data) {
        // Initialize empty array if no data exists
        const emptyData = [];
        localStorage.setItem(key, JSON.stringify(emptyData));
        return emptyData;
      }

      const parsed = JSON.parse(data);

      // Ensure we have an array of objects with the expected structure
      if (Array.isArray(parsed)) {
        // If it's an array of strings (old format), convert to new format
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          const converted = parsed.map(offerId => ({
            offerId: offerId,
            userId: userId,
            appliedAt: new Date().toISOString()
          }));
          applicationStorage.saveAppliedOffers(userId, converted);
          return converted.map(app => app.offerId);
        }

        // If it's already in the new format, extract offer IDs
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          return parsed.map(app => app.offerId);
        }

        return parsed; // Empty array
      }

      return [];
    } catch (error) {
      console.error('Error loading applied offers:', error);
      return [];
    }
  },

  // Save applied offers for a user
  saveAppliedOffers: (userId, applications) => {
    try {
      const key = applicationStorage.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(applications));
      return true;
    } catch (error) {
      console.error('Error saving applied offers:', error);
      return false;
    }
  },

  // Add a new application
  addApplication: (userId, offerId) => {
    try {
      const key = applicationStorage.getStorageKey(userId);
      const existing = JSON.parse(localStorage.getItem(key) || '[]');

      // Check if application already exists
      const alreadyApplied = existing.some(app =>
        (typeof app === 'string' && app === offerId) ||
        (typeof app === 'object' && app.offerId === offerId)
      );

      if (alreadyApplied) {
        console.log('User has already applied to this offer');
        return false;
      }

      // Create new application object
      const newApplication = {
        offerId: offerId,
        userId: userId,
        appliedAt: new Date().toISOString()
      };

      // Convert old format if necessary
      const normalizedExisting = existing.map(app => {
        if (typeof app === 'string') {
          return {
            offerId: app,
            userId: userId,
            appliedAt: new Date().toISOString()
          };
        }
        return app;
      });

      const updated = [...normalizedExisting, newApplication];
      localStorage.setItem(key, JSON.stringify(updated));

      console.log('Application saved:', newApplication);
      return true;
    } catch (error) {
      console.error('Error adding application:', error);
      return false;
    }
  },

  // Get all applications with full details
  getApplicationDetails: (userId) => {
    try {
      const key = applicationStorage.getStorageKey(userId);
      const data = localStorage.getItem(key);

      if (!data) return [];

      const parsed = JSON.parse(data);

      // Convert old format to new format if necessary
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map(offerId => ({
          offerId: offerId,
          userId: userId,
          appliedAt: new Date().toISOString()
        }));
      }

      return parsed;
    } catch (error) {
      console.error('Error getting application details:', error);
      return [];
    }
  }
};

// Main AdminDashboard component
export default function AdminDashboard() {
  const { user } = useAuth0();
  const { hasRole } = useSession();
  const isStudent = hasRole && hasRole("Estudiante");

  const [students] = useState([
    { id: 's1', nombre: 'Juan Pérez', paso_actual: 3, empresa: 'Tech Solutions' },
    { id: 's2', nombre: 'Maria García', paso_actual: 1, empresa: '' },
    { id: 's3', nombre: 'Pedro López', paso_actual: 5, empresa: 'Global Corp' },
  ]);

  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user ID from Auth0
  const getCurrentUserId = () => {
    return user?.sub || null;
  };

  // Load offers from API
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/offers`);
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error('Error loading offers:', error);
        setOffers([]);
      }
    };

    loadOffers();
  }, []);

  // Load applied offers when user is available
  useEffect(() => {
    if (isStudent && user?.sub) {
      const userId = getCurrentUserId();
      const loadedApplications = applicationStorage.loadAppliedOffers(userId);
      setAppliedOffers(loadedApplications);

      console.log('Loaded applied offers for user', userId, ':', loadedApplications);
    }
    setIsLoading(false);
  }, [isStudent, user]);

  // Handle applying to an offer
  const handleApply = async (offerId) => {
    const userId = getCurrentUserId();

    if (!userId) {
      console.error('No user ID available');
      return;
    }

    if (!offerId) {
      console.error('No offer ID provided');
      return;
    }

    // Check if already applied
    if (appliedOffers.includes(offerId)) {
      console.log('User has already applied to this offer');
      return;
    }

    // Add application to localStorage
    const success = applicationStorage.addApplication(userId, offerId);

    if (success) {
      // Update local state
      setAppliedOffers(prev => [...prev, offerId]);
      console.log('Successfully applied to offer:', offerId);

      // Optional: Show success message
      alert('Application submitted successfully!');
    } else {
      console.error('Failed to save application');
      alert('Failed to submit application. Please try again.');
    }
  };

  // Unified function to save (create or update) an offer (local only)
  const handleSaveOffer = (offerData) => {
    if (offerData._id) {
      // Edit existing offer
      setOffers((prev) =>
        prev.map((o) => (o._id === offerData._id ? { ...offerData } : o))
      );
    } else {
      // Create new offer
      const newOffer = {
        ...offerData,
        _id: 'o' + (offers.length + 1), // Generate simple id
      };
      setOffers((prev) => [...prev, newOffer]);
    }
    setEditingOffer(null);
    setShowCreateForm(false);
  };

  const handleDelete = (id) => {
    if (!id) {
      console.error('Error: Cannot delete offer without ID.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    setOffers((prev) => prev.filter((o) => o._id !== id));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333' }}>
        {isStudent ? 'Available Opportunities' : 'Administrator Panel'}
      </h2>


      {/* Only admins see students */}
      {!isStudent && (
        <>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginTop: 30 }}>
            Registered Students
          </h3>
          <StudentTable students={students} />
        </>
      )}

      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginTop: 30 }}>
        {isStudent ? 'Available Internship Offers' : 'Job Offers'}
      </h3>

      {/* Only admins see the add button */}
      {!isStudent && (
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            marginBottom: 20
          }}
        >
          Add New Offer
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
        appliedOffers={appliedOffers}
        onApply={handleApply}
      />

      {/* Form for CREATING new offer (appears as modal) */}
      {!isStudent && showCreateForm && (
        <OfferForm
          offer={null} // Pass null to indicate create mode
          onSave={handleSaveOffer}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Form for EDITING existing offer (appears as modal) */}
      {!isStudent && editingOffer && (
        <OfferForm
          offer={editingOffer} // Pass existing offer for editing
          onSave={handleSaveOffer}
          onCancel={() => setEditingOffer(null)}
        />
      )}
    </div>
  );
}