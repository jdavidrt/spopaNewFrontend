import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Circle } from "lucide-react";

const tasks = [
  <>Consulta la oferta de convocatorias publicadas en la plataforma SPOPA{" "}
    <Link to="/StudentOffers" className="text-blue-600 underline">aquí</Link>
    . También puedes establecer contacto con empresas de tu interés para el desarrollo de la práctica.
  </>,
  
  <>Verifica en la Oficina de Prácticas y Pasantías de tu facultad la existencia del convenio de apoyo interinstitucional;
    de no existir, la oficina te brindará la información para adelantar el proceso. Indica el nombre de la empresa y su NIT.
    Puedes ponerte en contacto con por medio del correo: <b>opp_fibog@unal.edu.co</b>.
  </>,
  "Solicita en la secretaría de tu programa curricular la carta de presentación con destino a la Empresa. [REEMPLAZAR ESTO CON EL GENERADOR DE CARTAS]",
  "Entra en contacto con la empresa de tu interes, y continua el proceso para que consideren tu candidatura a la posición de practicante.",
  <>Obtén el aval o acompañamiento de un docente tutor, con quien acordarás el plan de trabajo y los criterios de evaluación.
    Puedes encontrar un listado de los docentes con afiliación de área{" "}
    <Link to="/Professors" className="text-blue-600 underline">aquí</Link>.
  </>,
  <>Suscribe un contrato con la empresa, en el que se establezcan los términos de la pasantía:<br />
    <b>Fecha de inicio y terminación (que cubra el periodo académico), horario, cubrimiento de ARL, etc.</b><br />
    <i>Ten en cuenta que, de conformidad con el artículo 7, numeral 1 del Decreto 933 de 2003,
    las actividades desarrolladas por los estudiantes universitarios en calidad de pasantías que sean prerrequisito para
    la obtención del título correspondiente, "no constituyen contrato de aprendizaje”.</i>
  </>,
  <>Diligencia el formato de inscripción para trabajo de grado. Descárgalo{" "}
    <a href="https://ingenieria.bogota.unal.edu.co/es/dependencias/secretaria-academica/formatos.html?download=2478:formato-inscripcion-pasantia-trabajo-de-grado"
      className="text-blue-600 underline"
      target="_blank"
      rel="noopener noreferrer">
      aquí</a>
    .
  </>,
  <>
    Diligencia el formato de inscripción para prácticas. Descárgalo{" "}
    <a
      href="https://ingenieria.bogota.unal.edu.co/es/dependencias/secretaria-academica/formatos.html?download=2479:formato-inscripcion-practica"
      className="text-blue-600 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      aquí
    </a>
    .
  </>,
  <>
    Para solicitar la inscripción de la pasantía, ingresa a la página de Ingeniería en la sección de la secretaría de facultad y adjunta en un solo PDF: <b>
    Una copia del contrato firmado con la empresa, copia de la afiliación o pago de ARL, el formato de práctica, y el formato de trabajo de grado.</b><br />
    Si ya tienes todos los documentos, puedes solicitar tu inscripción{" "}
    <a
      href="https://ingenieria.bogota.unal.edu.co/es/dependencias/secretaria-academica/solicitudes-estudiantiles.html"
      className="text-blue-600 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      aquí
    </a>
    .
  </>,
  "Haz seguimiento al resultado de tu solicitud por medio de los canales de tu facultad.",
];

const Countdown = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-06-29T23:59:59");
    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return <p className="mt-4 text-red-600 font-semibold">¡Aplicaciones cerradas!</p>;
  }

  return (
    <div className="mt-6 text-center">
      <br/>
      <br/>
      <p className="text-lg font-semibold">Fecha límite del semestre actual: 29 de Junio 2025.</p>
      <h2 className="text-lg font-semibold">Tiempo restante para enviar tu aplicativo terminado:</h2>
      <h2 className="text-xl font-mono">
        {timeLeft.days} días, {timeLeft.hours} horas, {timeLeft.minutes} minutos, {timeLeft.seconds} segundos
      </h2>
    </div>
  );
};

const Checklist1 = () => {
  const [checked, setChecked] = useState(Array(tasks.length).fill(false));

  const toggleCheck = (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lista para mi proceso de aplicación</h1>
      <ul className="space-y-4">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-start space-x-3">
            <button onClick={() => toggleCheck(index)}
            className="focus:outline-none mr-2">
              {checked[index] ? (
                <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
              ) : (
                <Circle className="text-gray-400 w-6 h-6 flex-shrink-0" />
              )}
            </button>
            <span className={`text-lg ${checked[index] ? "line-through text-gray-500" : ""}`}>
            {task}
            
          </span>
          </li>
        ))}
      </ul>
      <Countdown />
    </div>
  );
};

const Checklist = () => (
  <>
    <Checklist1 />
    <hr className="my-6" />
  </>
);

export default Checklist;