import cron from 'node-cron';
import Reserva from '../models/reserva.model.js';
import { sendReservationEmail } from '../libs/emailService.js';

// Programa recordatorios para un rango de horas
const scheduleReminder = (timeRangeHours, reminderType) => {
  // Corre cada hora al minuto 0
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + timeRangeHours[0] * 3600000);
      const endTime = new Date(now.getTime() + timeRangeHours[1] * 3600000);

      // Busca reservas pendientes que aún no tienen recordatorio enviado
      const reservations = await Reserva.find({
        fecha: { $gte: startTime, $lte: endTime },
        estado: 'pendiente',
        [`${reminderType}ReminderSent`]: false
      }).populate('usuario', 'email username');

      for (const reserva of reservations) {
        // Obtiene email del usuario o invitado
        const email = reserva.usuario?.email || reserva.datosInvitado?.email || null;

        if (!email) continue;
        if (!reserva.cancha || !reserva.horario) continue;

        // Envía email de recordatorio
        const enviado = await sendReservationEmail({
          to: email,
          reservationId: reserva._id,
          courtName: reserva.cancha,
          date: reserva.fecha,
          time: reserva.horario,
          actionType: 'reminder'
        });

        // Marca como enviado si fue exitoso
        if (enviado) {
          reserva[`${reminderType}ReminderSent`] = true;
          await reserva.save();
          console.log(`Recordatorio '${reminderType}' enviado a ${email}`);
        }
      }
    } catch (error) {
      console.error(`Error en reminder '${reminderType}':`, error);
    }
  });
};

// Inicia los recordatorios
export const startSchedulers = () => {
  scheduleReminder([24, 48], 'first'); // 24-48 horas antes
  scheduleReminder([12, 12], 'final'); // 12 horas antes
  console.log('Recordatorios activados');
};
