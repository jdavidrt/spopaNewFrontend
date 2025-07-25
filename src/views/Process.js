// frontend/src/components/Procesos.js
import React, { useEffect, useState } from "react";
import { useSession, getCurrentUserId } from "../utils/sessionManager";

function Process() {
  const { hasRole } = useSession();
  const isStudent = hasRole && hasRole("Estudiante");
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Load applied offers (full offer objects) from localStorage for the current student
  useEffect(() => {
    if (isStudent && getCurrentUserId) {
      const userId = getCurrentUserId();
      const saved = localStorage.getItem(`appliedOffers_${userId}`);
      setAppliedOffers(saved ? JSON.parse(saved) : []);
    }
  }, [isStudent, getCurrentUserId]);

  return (
    <div>
      <h2>Procesos de Inscripción</h2>
      {mensaje && <p>{mensaje}</p>}
      {isStudent ? (
        <>
          <h3>Ofertas a las que has aplicado</h3>
          {appliedOffers.length === 0 ? (
            <p>No has aplicado a ninguna oferta.</p>
          ) : (
            <ul>
              {appliedOffers.map((offer, idx) => (
                <li key={offer._id || idx}>
                  <b>{offer.titulo}</b> en <b>{offer.nombre_empresa}</b> ({offer.ciudad})<br />
                  Modalidad: {offer.modalidad} | Vacantes: {offer.vacantes}
                </li>
              ))}
            </ul>
          )}
          <pre>
            {/* Mostrar el JSON completo de procesos del estudiante */}
            {JSON.stringify(appliedOffers, null, 2)}
          </pre>
        </>
      ) : (
        <p>Solo los estudiantes pueden ver sus procesos de aplicación aquí.</p>
      )}
    </div>
  );
}

export default Process;