import Reserva from '../models/reserva.model.js';

export const exportReservasCSV = async (req, res) => {
  try {
    const reservas = await Reserva.find().lean();

    if (!reservas.length) {
      return res.status(404).send('No hay reservas');
    }

    // Función para dos dígitos
    const pad = n => n !== undefined && n !== null ? n.toString().padStart(2, '0') : '';

    const reservasAplanadas = reservas.map(r => {
  const fechaObj = r.fecha ? new Date(r.fecha) : null;
  const createdObj = r.createdAt ? new Date(r.createdAt) : null;
  return {
    ...r,
    usuario_nombre: r.datosInvitado?.nombre || '',
    usuario_email: r.datosInvitado?.email || '',
    usuario_telefono: r.datosInvitado?.telefono || '',
    fecha_dia: fechaObj ? pad(fechaObj.getUTCDate()) : '',
    fecha_mes: fechaObj ? pad(fechaObj.getUTCMonth() + 1) : '',
    fecha_anio: fechaObj ? fechaObj.getUTCFullYear() : '',
    hora: r.horario || '',
    created_dia: createdObj ? pad(createdObj.getUTCDate()) : '',
    created_mes: createdObj ? pad(createdObj.getUTCMonth() + 1) : '',
    created_anio: createdObj ? createdObj.getUTCFullYear() : '',
    created_hora: createdObj ? pad(createdObj.getUTCHours()) + ':' + pad(createdObj.getUTCMinutes()) : '',
    datosInvitado: undefined
  };
});

    const fields = [
      '_id', 'cancha',
      'fecha_dia', 'fecha_mes', 'fecha_anio', 'hora',
      'metodoPago', 'tipo', 'estado',
      'usuario_nombre', 'usuario_email', 'usuario_telefono',
      'created_dia', 'created_mes', 'created_anio', 'created_hora',
      'updatedAt'
    ];

    // Generar nombre de archivo dinámico con fecha y hora de descarga
    const now = new Date();
    const fileName = `ReportePlayNow_${pad(now.getDate())}_${pad(now.getMonth() + 1)}_${now.getFullYear()}_${pad(now.getHours())}_${pad(now.getMinutes())}.csv`;

    const csvRows = [
      fields.join(','), // header
      ...reservasAplanadas.map(r =>
        fields.map(f => `"${(r[f] ?? '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(csvRows.join('\n'));
  } catch (error) {
    console.error('Error exportando reservas:', error);
    res.status(500).send('Error interno del servidor');
  }
};