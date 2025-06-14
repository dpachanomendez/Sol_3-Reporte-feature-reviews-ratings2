import Reserva from '../models/reserva.model.js';
import User from '../models/user.model.js';
import { sendReservationEmail } from '../libs/emailService.js';

async function getUserDetails(reserva) {
  try {
    if (reserva.usuario) {
      const user = await User.findById(reserva.usuario).select('email username');
      return {
        email: user?.email,
        name: user?.username || 'Cliente'
      };
    }
    return {
      email: reserva.datosInvitado?.email,
      name: reserva.datosInvitado?.nombre || 'Invitado'
    };
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    return { email: null, name: 'Cliente' };
  }
}

function validateReservaAction(reserva, action) {
  const now = new Date();
  const reservaDate = new Date(reserva.fecha);
  
  if (reservaDate < now) {
    return { valid: false, message: 'No se puede modificar una reserva pasada' };
  }
  return { valid: true };
}

async function handleAction(req, res, action) {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    const validation = validateReservaAction(reserva, action);
    if (!validation.valid) return res.status(400).json({ error: validation.message });

    // Actualizar reserva
    reserva.estado = action === 'confirm' ? 'confirmada' : 'cancelada';
    reserva.lastActionAt = new Date();
    await reserva.save();

    // Enviar notificación
    const { email, name } = await getUserDetails(reserva);
    if (email) {
      await sendReservationEmail({
        to: email,
        reservationId: reserva._id,
        courtName: reserva.cancha,
        date: reserva.fecha,
        time: reserva.horario,
        actionType: action === 'confirm' ? 'confirmation' : 'cancellation'
      });
    }

    return res.json({ 
      success: true,
      reserva: {
        id: reserva._id,
        estado: reserva.estado,
        cancha: reserva.cancha,
        fecha: reserva.fecha
      }
    });
  } catch (error) {
    console.error(`Error en ${action} reserva:`, error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export const confirmReserva = (req, res) => handleAction(req, res, 'confirm');
export const cancelReserva = (req, res) => handleAction(req, res, 'cancel');