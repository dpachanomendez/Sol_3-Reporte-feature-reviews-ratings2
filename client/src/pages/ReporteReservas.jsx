import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ReporteReservas() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
  setDownloading(true);
  setError('');
  try {
    const response = await fetch(`${API_URL}/api/reservas/reporte/csv`, {
      credentials: 'include'
    });
    if (!response.ok) {
      setError('Error al descargar el reporte');
      setDownloading(false);
      return;
    }
    const blob = await response.blob();

    // Extraer el nombre del archivo del header
    const disposition = response.headers.get('Content-Disposition');
    let fileName = 'reporte.csv';
    if (disposition && disposition.includes('filename=')) {
      fileName = disposition
        .split('filename=')[1]
        .replace(/["']/g, '')
        .trim();
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte_PlayNow';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    setError('Ocurrió un error inesperado');
  } finally {
    setDownloading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] rounded-lg shadow p-8"
    style={{ backgroundColor: "#3f3f46" }}>
      <h1 className="text-3xl font-bold mb-4 text-blue-500">Reporte de Reservas</h1>
      <p className="mb-6 text-white text-center max-w-md">
        Descarga un informe completo de todas las reservas del sistema en formato CSV.
      </p>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition 
          ${downloading ? 'bg-indigo-500 cursor-not-allowed' : 'bg-indigo-500 hover:bg-blue-700'}`}
      >
        {downloading ? 'Descargando...' : 'Descargar CSV'}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}