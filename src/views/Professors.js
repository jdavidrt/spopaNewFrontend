import React, { useState, useEffect } from "react";

const ProfessorsTable = () => {
  const [professors, setProfessors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    const fetchProfessors = async () => {
      // Enhanced professor data with 16 professors total
      const result = [
        {
          id: 1,
          nombre: "Jeisson Andrés Vergara Vargas",
          cargo: "Profesor Asociado",
          departamento: "Ingeniería de Sistemas y Computación",
          correo: "javergarav@unal.edu.co",
          especialidad: "Inteligencia Artificial y Machine Learning",
          oficina: "453-25"
        },
        {
          id: 2,
          nombre: "María Elena Rodríguez Castro",
          cargo: "Profesora Titular",
          departamento: "Ingeniería Civil y Agrícola",
          correo: "merodriguezc@unal.edu.co",
          especialidad: "Estructuras y Geotecnia",
          oficina: "214-15"
        },
        {
          id: 3,
          nombre: "Carlos Alberto Martínez Peña",
          cargo: "Profesor Asistente",
          departamento: "Ingeniería Química y Ambiental",
          correo: "camartinezp@unal.edu.co",
          especialidad: "Procesos Químicos y Biotecnología",
          oficina: "401-08"
        },
        {
          id: 4,
          nombre: "Ana Sofía Herrera Molina",
          cargo: "Profesora Asociada",
          departamento: "Ingeniería Eléctrica y Electrónica",
          correo: "asherrerom@unal.edu.co",
          especialidad: "Sistemas de Potencia y Energías Renovables",
          oficina: "302-12"
        },
        {
          id: 5,
          nombre: "Diego Fernando López Quintero",
          cargo: "Profesor Titular",
          departamento: "Ingeniería Mecánica y Mecatrónica",
          correo: "dflopezq@unal.edu.co",
          especialidad: "Robótica y Automatización Industrial",
          oficina: "501-20"
        },
        {
          id: 6,
          nombre: "Patricia Alejandra Gómez Silva",
          cargo: "Profesora Asistente",
          departamento: "Ingeniería de Sistemas y Computación",
          correo: "pagomezs@unal.edu.co",
          especialidad: "Desarrollo de Software y Bases de Datos",
          oficina: "453-18"
        },
        {
          id: 7,
          nombre: "Roberto Carlos Vargas Méndez",
          cargo: "Profesor Asociado",
          departamento: "Ingeniería Industrial",
          correo: "rcvargasm@unal.edu.co",
          especialidad: "Investigación de Operaciones y Logística",
          oficina: "601-05"
        },
        {
          id: 8,
          nombre: "Laura Cristina Jiménez Torres",
          cargo: "Profesora Titular",
          departamento: "Ingeniería Química y Ambiental",
          correo: "lcjimenezt@unal.edu.co",
          especialidad: "Ingeniería Ambiental y Sostenibilidad",
          oficina: "401-22"
        },
        {
          id: 9,
          nombre: "Andrés Felipe Morales García",
          cargo: "Profesor Asistente",
          departamento: "Ingeniería Civil y Agrícola",
          correo: "afmoralesg@unal.edu.co",
          especialidad: "Hidráulica e Hidrología",
          oficina: "214-30"
        },
        {
          id: 10,
          nombre: "Valentina Beatriz Acosta Ruiz",
          cargo: "Profesora Asociada",
          departamento: "Ingeniería Eléctrica y Electrónica",
          correo: "vbacostar@unal.edu.co",
          especialidad: "Telecomunicaciones y Procesamiento de Señales",
          oficina: "302-25"
        },
        {
          id: 11,
          nombre: "Juan Pablo Restrepo Henao",
          cargo: "Profesor Titular",
          departamento: "Ingeniería Mecánica y Mecatrónica",
          correo: "jprestrepoh@unal.edu.co",
          especialidad: "Termodinámica y Transferencia de Calor",
          oficina: "501-14"
        },
        {
          id: 12,
          nombre: "Mónica Patricia Sánchez Ortega",
          cargo: "Profesora Asistente",
          departamento: "Ingeniería Industrial",
          correo: "mpsanchezo@unal.edu.co",
          especialidad: "Gestión de la Calidad y Mejora Continua",
          oficina: "601-18"
        },
        {
          id: 13,
          nombre: "Oscar Mauricio Hernández Díaz",
          cargo: "Profesor Asociado",
          departamento: "Ingeniería de Sistemas y Computación",
          correo: "omhernandezd@unal.edu.co",
          especialidad: "Seguridad Informática y Criptografía",
          oficina: "453-32"
        },
        {
          id: 14,
          nombre: "Claudia Marcela Rivera Espinosa",
          cargo: "Profesora Titular",
          departamento: "Ingeniería Química y Ambiental",
          correo: "cmriverae@unal.edu.co",
          especialidad: "Nanotecnología y Materiales Avanzados",
          oficina: "401-35"
        },
        {
          id: 15,
          nombre: "Santiago Alejandro Ramírez Cruz",
          cargo: "Profesor Asistente",
          departamento: "Ingeniería Civil y Agrícola",
          correo: "saramirezc@unal.edu.co",
          especialidad: "Ingeniería de Transporte y Vías",
          oficina: "214-42"
        },
        {
          id: 16,
          nombre: "Isabella Carolina Torres Medina",
          cargo: "Profesora Asociada",
          departamento: "Ingeniería Eléctrica y Electrónica",
          correo: "ictorresm@unal.edu.co",
          especialidad: "Inteligencia Artificial aplicada a Sistemas Eléctricos",
          oficina: "302-38"
        }
      ];
      setProfessors(result);
    };

    fetchProfessors();
  }, []);

  // Get unique departments for filter
  const departments = [...new Set(professors.map(prof => prof.departamento))];

  // Filter professors
  const filteredProfessors = professors.filter((prof) => {
    const matchesSearch = Object.values(prof).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(search.toLowerCase())
    );

    const matchesDepartment = selectedDepartment === "" || prof.departamento === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Get professor's initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get background color based on department
  const getDepartmentColor = (department) => {
    const colors = {
      "Ingeniería de Sistemas y Computación": "#3B82F6",
      "Ingeniería Civil y Agrícola": "#10B981",
      "Ingeniería Química y Ambiental": "#8B5CF6",
      "Ingeniería Eléctrica y Electrónica": "#F59E0B",
      "Ingeniería Mecánica y Mecatrónica": "#EF4444",
      "Ingeniería Industrial": "#06B6D4"
    };
    return colors[department] || "#6B7280";
  };

  // Get position badge color
  const getCargoColor = (cargo) => {
    if (cargo.includes("Titular")) return "#DC2626";
    if (cargo.includes("Asociado")) return "#059669";
    if (cargo.includes("Asistente")) return "#2563EB";
    return "#6B7280";
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Faculty Directory
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            margin: 0
          }}>
            Meet our distinguished professors from the Engineering Faculty
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Search Professors
              </label>
              <input
                type="text"
                placeholder="Search by name, department, or specialty..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Filter by Department
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {filteredProfessors.length} professor{filteredProfessors.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Professors Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {filteredProfessors.length > 0 ? (
            filteredProfessors.map((prof) => (
              <div
                key={prof.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Header with department color */}
                <div
                  style={{
                    height: '4px',
                    backgroundColor: getDepartmentColor(prof.departamento)
                  }}
                />

                <div style={{ padding: '24px' }}>
                  {/* Avatar and basic info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: getDepartmentColor(prof.departamento),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginRight: '16px',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(prof.nombre)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: '0 0 8px 0',
                        lineHeight: '1.3'
                      }}>
                        {prof.nombre}
                      </h3>
                      <span
                        style={{
                          backgroundColor: getCargoColor(prof.cargo),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {prof.cargo}
                      </span>
                    </div>
                  </div>

                  {/* Department */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '600'
                    }}>
                      🏛️ {prof.departamento}
                    </div>
                  </div>

                  {/* Specialty */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      💡 {prof.especialidad}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                    marginTop: '16px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      📧 <a
                        href={`mailto:${prof.correo}`}
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {prof.correo}
                      </a>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '16px'
                    }}>
                      🚪 Office: {prof.oficina}
                    </div>

                    {/* Contact button */}
                    <a
                      href={`mailto:${prof.correo}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textAlign: 'center',
                        padding: '10px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      Contact Professor
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                No professors found
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#9ca3af',
                margin: 0
              }}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>

        {/* Department legend */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginTop: '32px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Department Colors
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {departments.map((dept) => (
              <div key={dept} style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: getDepartmentColor(dept),
                    marginRight: '12px',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  color: '#4b5563'
                }}>
                  {dept}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessorsTable;