import React, { useState, useEffect } from "react";

const ProfessorsTable = () => {
  const [professors, setProfessors] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProfessors = async () => {
      // Reemplazar con una llamada real a tu API
      const result = [
        {
          id: 1,
          nombre: "Jeisson Andrés Vergara Vargas",
          cargo: "Profesor Asociado",
          departamento: "Ingeniería de Sistemas y Computación",
          correo: "javergarav@unal.edu.co",
        },
      ];
      setProfessors(result);
    };

    fetchProfessors();
  }, []);

  const filteredProfessors = professors.filter((prof) =>
    Object.values(prof).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Listado de Profesores</h1>

      <input
        type="text"
        placeholder="Buscar por nombre, departamento, etc..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-xl">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Cargo</th>
              <th className="px-4 py-2">Departamento</th>
              <th className="px-4 py-2">Correo</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfessors.length > 0 ? (
              filteredProfessors.map((prof, index) => (
                <tr key={prof.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{prof.nombre}</td>
                  <td className="px-4 py-2">{prof.cargo}</td>
                  <td className="px-4 py-2">{prof.departamento}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`mailto:${prof.correo}`}
                      className="text-blue-600 underline"
                    >
                      {prof.correo}
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  No se encontraron profesores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessorsTable;
