import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";  

const emptyOffer = {
  company_id: "",
  title: "",
  position: "",
  department: "",
  schedule: "",
  flex_schedule: false,
  modality: "",
  contract_type: "",
  salary: "",
  opening_date: "",
  closing_date: "",
  vacancies: 1,
};

export default function CreateOfferForm({ onClose, onCreated }) {
  const [offer, setOffer] = useState(emptyOffer);
  const [companies, setCompanies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar empresas 
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8010/api/companies");
        const data = await res.json();
        setCompanies(data);
      } catch {
        setError("No se pudo cargar la lista de empresas");
      }
    })();
  }, []);

  // Manejadores del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOffer((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // validar campos requeridos
    const required = [
      "company_id",
      "title",
      "position",
      "schedule",
      "modality",
      "opening_date",
      "closing_date",
      "vacancies",
    ];
    const missing = required.filter((k) => !offer[k]);
    if (missing.length) {
      setError("Faltan campos obligatorios");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8010/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...offer, vacancies: Number(offer.vacancies) }),
      });
      if (!res.ok) throw new Error("Error al crear la oferta");
      await res.json();
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Prevent background scrolling when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Create modal element
  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '672px',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflowY: 'auto',
          border: '1px solid #e5e7eb'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#6b7280',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#6b7280';
          }}
        >
          ×
        </button>
        
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Nueva oferta</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {/* Empresa */}
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Empresa *</span>
            <select
              name="company_id"
              value={offer.company_id}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona una empresa</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} – {c.city}
                </option>
              ))}
            </select>
          </label>

          {/* Título y cargo */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Título *</span>
            <input
              name="title"
              value={offer.title}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Cargo *</span>
            <input
              name="position"
              value={offer.position}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          {/* Departamento y modalidad */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Área</span>
            <input
              name="department"
              value={offer.department}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Modalidad *</span>
            <input
              name="modality"
              value={offer.modality}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          {/* Horario y horario flexible */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Horario *</span>
            <input
              name="schedule"
              value={offer.schedule}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="L‑V 8 am‑5 pm"
              required
            />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="flex_schedule"
              checked={offer.flex_schedule}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Horario flexible</span>
          </label>

          {/* Fechas de publicación */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Apertura *</span>
            <input
              type="date"
              name="opening_date"
              value={offer.opening_date}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Cierre *</span>
            <input
              type="date"
              name="closing_date"
              value={offer.closing_date}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          {/* Vacantes y salario */}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Vacantes *</span>
            <input
              type="number"
              min="1"
              name="vacancies"
              value={offer.vacancies}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Salario</span>
            <input
              name="salary"
              value={offer.salary}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej: 1 500 000 COP"
            />
          </label>

          {/* Botones */}
          <div className="col-span-full mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}