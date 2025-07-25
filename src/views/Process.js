// frontend/src/components/Procesos.js
import React, { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_PROCESS_API || "http://localhost:3010/api/process";

console.log("🪼🪼🪼🪼🪼🪼", API_URL)
function Process() {
  const [process, setProcesos] = useState([]);
  const [nuevoProceso, setNuevoProceso] = useState({
    estudiante_id: "",
    oferta_id: "",
    profesor_id: "",
    estado: "pendiente_tutor",
  });
  const [mensaje, setMensaje] = useState("");

  // Obtener todos los procesos al cargar el componente
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setProcesos)
      .catch(() => setMensaje("Error al cargar procesos"));
  }, []);

  // Crear un nuevo proceso
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProceso),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProcesos([...process, data]);
      setMensaje("Proceso creado correctamente");
    } catch {
      setMensaje("Error al crear proceso");
    }
  };

  // Cambiar estado de un proceso
  const cambiarEstado = async (id, nuevoEstado) => {
    setMensaje("");
    try {
      const res = await fetch(`${API_URL}/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProcesos(process.map(p => (p.id === id ? data : p)));
      setMensaje("Estado actualizado");
    } catch {
      setMensaje("Error al actualizar estado");
    }
  };

  return (
    <div>
      <h2>Procesos de Inscripción</h2>
      {mensaje && <p>{mensaje}</p>}
      <ul>
        {process.map((p) => (
          <li key={p.id}>
            Proceso #{p.id} - Estado: {p.estado}
            <button onClick={() => cambiarEstado(p.id, "iniciado")}>Iniciar</button>
            <button onClick={() => cambiarEstado(p.id, "aprobado")}>Aprobar</button>
            <button onClick={() => cambiarEstado(p.id, "rechazado")}>Rechazar</button>
          </li>
        ))}
      </ul>
      <h3>Crear nuevo proceso</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="ID Estudiante"
          value={nuevoProceso.estudiante_id}
          onChange={e => setNuevoProceso({ ...nuevoProceso, estudiante_id: e.target.value })}
          required
        />
        <input
          placeholder="ID Oferta"
          value={nuevoProceso.oferta_id}
          onChange={e => setNuevoProceso({ ...nuevoProceso, oferta_id: e.target.value })}
          required
        />
        <input
          placeholder="ID Profesor"
          value={nuevoProceso.profesor_id}
          onChange={e => setNuevoProceso({ ...nuevoProceso, profesor_id: e.target.value })}
          required
        />
        <button type="submit">Crear</button>
      </form>
    </div>
  );
}

export default Process;