
import Reserva from '../models/reserva.model.js';
import User from '../models/user.model.js';
import { sendEmail } from '../libs/emailService.js';

const getBackendUrl = () => process.env.BACKEND_URL || 'http://localhost:4000';

export async function createReservationAndNotify(reservationData, userId) {
  try {
    const nuevaReserva = new Reserva({
      ...reservationData,
      usuario: userId,
      tipo: 'usuario', 
      estado: reservationData.estado || 'pendiente', 
    });

    await nuevaReserva.save();

    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        const reservationId = nuevaReserva._id;
        const backendUrl = getBackendUrl();
        const confirmLink = `${backendUrl}/api/reservas/${reservationId}/confirm`;
        const cancelLink = `${backendUrl}/api/reservas/${reservationId}/cancel`;

        const subject = 'Confirmación de reserva';
        const text = `Hola ${user.username},\n\nTu reserva para la cancha ${nuevaReserva.cancha} el ${new Date(nuevaReserva.fecha).toLocaleDateString()} a las ${nuevaReserva.horario} ha sido creada.\n\nPor favor, confirma tu reserva aquí: ${confirmLink}\nSi deseas cancelar, haz clic aquí: ${cancelLink}\n\nGracias.`;
        const html = `<p>Hola ${user.username},</p><p>Tu reserva para la cancha <strong>${nuevaReserva.cancha}</strong> el <strong>${new Date(nuevaReserva.fecha).toLocaleDateString()}</strong> a las <strong>${nuevaReserva.horario}</strong> ha sido creada.</p><p>Por favor, confirma tu reserva haciendo clic en el siguiente enlace: <a href="${confirmLink}">${confirmLink}</a></p><p>Si deseas cancelar tu reserva, haz clic en el siguiente enlace: <a href="${cancelLink}">${cancelLink}</a></p><p>Gracias.</p>`;

        await sendEmail({
          to: user.email,
          subject,
          text,
          html,
        });
        console.log(`Email de confirmación enviado a ${user.email} para reserva ${reservationId}`);
      } else {
        console.log(`Usuario ${userId} no encontrado o sin email para la reserva ${nuevaReserva._id}.`);
      }
    } catch (emailError) {
      console.error(`Error al enviar email de confirmación para la reserva ${nuevaReserva._id}:`, emailError);
      
    }

    return nuevaReserva;
  } catch (dbError) {
    console.error('Error al crear la reserva en la base de datos:', dbError);
    throw dbError; 
  }
}

export async function createGuestReservationAndNotify(reservationData) {
  try {
    const nuevaReserva = new Reserva({
      ...reservationData,
      tipo: 'invitado', 
      estado: reservationData.estado || 'pendiente', 
      datosInvitado: reservationData.datosInvitado, 
    });

    await nuevaReserva.save();

    try {
      const guestEmail = nuevaReserva.datosInvitado?.email;
      const guestName = nuevaReserva.datosInvitado?.nombre || 'Invitado';
      if (guestEmail) {
        const reservationId = nuevaReserva._id;
        const backendUrl = getBackendUrl();
        const confirmLink = `${backendUrl}/api/reservas/${reservationId}/confirm`;
        const cancelLink = `${backendUrl}/api/reservas/${reservationId}/cancel`;

        const subject = 'Confirmación de reserva';
        const text = `Hola ${guestName},\n\nTu reserva para la cancha ${nuevaReserva.cancha} el ${new Date(nuevaReserva.fecha).toLocaleDateString()} a las ${nuevaReserva.horario} ha sido creada.\n\nPor favor, confirma tu reserva aquí: ${confirmLink}\nSi deseas cancelar, haz clic aquí: ${cancelLink}\n\nGracias.`;
        const html = `<p>Hola ${guestName},</p><p>Tu reserva para la cancha <strong>${nuevaReserva.cancha}</strong> el <strong>${new Date(nuevaReserva.fecha).toLocaleDateString()}</strong> a las <strong>${nuevaReserva.horario}</strong> ha sido creada.</p><p>Por favor, confirma tu reserva haciendo clic en el siguiente enlace: <a href="${confirmLink}">${confirmLink}</a></p><p>Si deseas cancelar tu reserva, haz clic en el siguiente enlace: <a href="${cancelLink}">${cancelLink}</a></p><p>Gracias.</p>`;

        await sendEmail({
          to: guestEmail,
          subject,
          text,
          html,
        });
        console.log(`Email de confirmación enviado a ${guestEmail} para reserva de invitado ${reservationId}`);
      } else {
        console.log(`Email de invitado no proporcionado para la reserva ${nuevaReserva._id}.`);
      }
    } catch (emailError) {
      console.error(`Error al enviar email de confirmación para reserva de invitado ${nuevaReserva._id}:`, emailError);
      
    }

    return nuevaReserva;
  } catch (dbError) {
    console.error('Error al crear la reserva de invitado en la base de datos:', dbError);
    throw dbError; 
  }
}
