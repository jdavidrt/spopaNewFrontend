import React, { useEffect, useState } from "react";
import CreateOfferForm from "../components/CreateOfferForm";

const Offers = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);

  // Move fetchData outside of useEffect so it can be reused
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8010/api/offers`);
      if (!response.ok) {
        throw new Error('Error al obtener las ofertas');
      }

      const result = await response.json();

      const adaptedData = result.map((oferta) => ({
        id: oferta.id,
        "Nombre de la entidad": oferta.company.name,
        "Cargo": oferta.position,
        "Área": oferta.department,
        "Modalidad": oferta.modality,
        "Ciudad": oferta.company.city,
        "Correo electrónico": oferta.company.email,
      }));

      setData(adaptedData);
    } catch (error) {
      console.error("Error al obtener las ofertas:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtro por campos clave
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleCreateCompany = async () => {
    const name = prompt("Nombre de la empresa:");
    const sector = prompt("Sector:");
    const email = prompt("Correo electrónico:");
    const city = prompt("Ciudad:");

    if (!name || !sector || !email || !city) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await fetch("http://localhost:8010/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, sector, email, city }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la empresa");
      }

      alert("Empresa creada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la empresa");
    }
  };

  const openOfferForm = () => setShowOfferForm(true);
  const closeOfferForm = () => setShowOfferForm(false);
  const refreshOffers = () => fetchData(); // Now fetchData is accessible

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscador de Convocatorias</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-green-600 hover:bg-green-900 text-black font-semibold px-4 py-2 rounded-xl shadow"
          onClick={handleCreateCompany}
        >
          Crear Empresa
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-900 text-black font-semibold px-4 py-2 rounded-xl shadow"
          onClick={openOfferForm}
        >
          Crear oferta
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar por entidad, cargo, ciudad..."
        className="w-full p-3 mb-6 border border-gray-300 rounded-xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-xl">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Entidad</th>
              <th className="px-4 py-2">Cargo</th>
              <th className="px-4 py-2">Área</th>
              <th className="px-4 py-2">Modalidad</th>
              <th className="px-4 py-2">Ciudad</th>
              <th className="px-4 py-2">Correo</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr key={item.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{item["Nombre de la entidad"]}</td>
                  <td className="px-4 py-2">{item["Cargo"]}</td>
                  <td className="px-4 py-2">{item["Área"]}</td>
                  <td className="px-4 py-2">{item["Modalidad"]}</td>
                  <td className="px-4 py-2">{item["Ciudad"]}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`mailto:${item["Correo electrónico"]}`}
                      className="text-blue-600 underline"
                    >
                      {item["Correo electrónico"]}
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showOfferForm && (
        <CreateOfferForm onClose={closeOfferForm} onCreated={refreshOffers} />
      )}
    </div>
  );
};

export default Offers;