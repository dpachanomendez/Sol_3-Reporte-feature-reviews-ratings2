import { Link } from "react-router-dom";
import { useState } from "react";
import ReviewsPage from "./ReviewsPage"; // Ajusta la ruta según tu estructura

function HomePageLog() {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <section className="flex justify-center items-center relative min-h-screen">
      {/* Contenido principal */}
      <header className="bg-zinc-800 p-10 rounded-lg shadow-xl">
        <h1 className="text-5xl py-2 font-bold text-white">Reserva de canchas deportivas</h1>
        <p className="text-md text-slate-300 mb-6">
          Juega hoy en los recintos más exclusivos de la ciudad. Reserva tu cancha ahora.
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* Botón de reserva (existente) */}
          <Link
            className="flex-1 min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white text-center px-6 py-3 rounded-md transition"
            to="/reserva"
          >
            Hacer una reserva
          </Link>

          {/* Botón para abrir reseñas (nuevo) */}
          <button
            onClick={() => setShowReviews(true)}
            className="flex-1 min-w-[200px] bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md transition"
          >
            Ver reseñas
          </button>
        </div>
      </header>

      {/* Modal de reseñas (aparece al hacer clic en "Ver reseñas") */}
      {showReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowReviews(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl bg-white rounded-full p-1"
            >
              ✕
            </button>
            <ReviewsPage /> {/* Renderiza el componente completo de reseñas */}
          </div>
        </div>
      )}
    </section>
  );
}

export default HomePageLog;