import Reserva from '../models/reserva.model.js';
import { sendReservationEmail } from '../libs/emailService.js';

// Mapeo de nombres de cancha a IDs para calcular precio
const preciosCanchas = {
  'Fútbol 1': 50,
  'Fútbol 2': 70,
  'Tenis 1': 100
};

// Función auxiliar mejorada para calcular precio
const calcularPrecio = (nombreCancha) => {
  return preciosCanchas[nombreCancha] || 0;
};

// Middleware para validar reserva
const validarReserva = async (req, res, next) => {
  try {
    if (!req.body.fecha || !req.body.horario || !req.body.cancha) {
      return res.status(400).json({
        success: false,
        message: 'Fecha, horario y cancha son requeridos'
      });
    }

    const fechaReserva = new Date(req.body.fecha);
    if (isNaN(fechaReserva.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Fecha inválida'
      });
    }

    req.fechaReserva = fechaReserva;
    next();
  } catch (error) {
    console.error('Error en validarReserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar los datos de reserva'
    });
  }
};

export const deleteReservaAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReserva = await Reserva.findByIdAndDelete(id);

    if (!deletedReserva) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    res.json({ message: 'Reserva eliminada exitosamente.' }); // 200 OK with message
    // Or, for 204 No Content:
    // res.status(204).send();
  } catch (error) {
    console.error('Error en deleteReservaAdmin:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de reserva inválido.' });
    }
    res.status(500).json({ message: 'Error al eliminar la reserva.', error: error.message });
  }
};

export const updateReservaAdmin = async (req, res) => {
  const { id } = req.params;
  const { fecha, horario, cancha, estado, datosInvitado, metodoPago } = req.body;

  const updateFields = {};

  if (fecha) {
    const newDate = new Date(fecha);
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ message: 'Fecha inválida proporcionada.' });
    }
    updateFields.fecha = newDate;
  }
  if (horario) updateFields.horario = horario;
  if (cancha) updateFields.cancha = cancha;

  // Assuming 'Reserva.schema.path('estado').enumValues' holds the allowed states
  const allowedEstados = Reserva.schema.path('estado').enumValues;
  if (estado) {
    if (allowedEstados && allowedEstados.includes(estado)) {
      updateFields.estado = estado;
    } else {
      return res.status(400).json({ message: `Estado inválido. Los valores permitidos son: ${allowedEstados.join(', ')}` });
    }
  }

  if (metodoPago) updateFields.metodoPago = metodoPago;

  if (datosInvitado) {
    if (typeof datosInvitado.nombre === 'string') updateFields['datosInvitado.nombre'] = datosInvitado.nombre;
    if (typeof datosInvitado.email === 'string') updateFields['datosInvitado.email'] = datosInvitado.email;
    if (typeof datosInvitado.telefono === 'string') updateFields['datosInvitado.telefono'] = datosInvitado.telefono;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
  }

  try {
    const updatedReserva = await Reserva.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('usuario', 'username email');

    if (!updatedReserva) {
      return res.status(404).json({ message: 'Reserva no encontrada.' });
    }

    res.json(updatedReserva);
  } catch (error) {
    console.error('Error en updateReservaAdmin:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de reserva inválido.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Error de validación.', errors: error.errors });
    }
    res.status(500).json({ message: 'Error al actualizar la reserva.', error: error.message });
  }
};

export const crearReserva = async (req, res) => {
  try {
    // Verificar disponibilidad
    const reservaExistente = await Reserva.findOne({
      cancha: req.body.cancha,
      fecha: req.fechaReserva,
      horario: req.body.horario,
      estado: { $ne: 'cancelada' } // Ignorar reservas canceladas
    });

    if (reservaExistente) {
      return res.status(400).json({ 
        success: false,
        message: `La cancha ${req.body.cancha} ya está reservada para el ${req.fechaReserva.toLocaleDateString()} a las ${req.body.horario}` 
      });
    }

    // Crear nueva reserva
    const nuevaReserva = new Reserva({
      ...req.body,
      fecha: req.fechaReserva,
      usuario: req.auth.userId,
      tipo: 'usuario',
      estado: 'pendiente'
    });

    await nuevaReserva.save();
    if (req.body.email) {
  await sendReservationEmail({
    to: req.body.email,
    reservationId: nuevaReserva._id,
    courtName: nuevaReserva.cancha,
    date: nuevaReserva.fecha,
    time: nuevaReserva.horario,
    actionType: 'initial'
  });
}

    return res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        id: nuevaReserva._id,
        cancha: nuevaReserva.cancha,
        fecha: nuevaReserva.fecha,
        horario: nuevaReserva.horario,
        estado: nuevaReserva.estado
      }
    });

  } catch (error) {
    console.error('Error en crearReserva:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la reserva'
    });
  }
};

export const crearReservaInvitado = async (req, res) => {
  try {
    // Validación de datos del invitado
    if (!req.body.nombre || !req.body.email) {
      return res.status(400).json({ 
        success: false,
        message: 'Nombre y email son requeridos para reservas de invitados' 
      });
    }

    // Verificar disponibilidad
    const reservaExistente = await Reserva.findOne({
      cancha: req.body.cancha,
      fecha: req.fechaReserva,
      horario: req.body.horario,
      estado: { $ne: 'cancelada' }
    });

    if (reservaExistente) {
      return res.status(400).json({ 
        success: false,
        message: `La cancha ${req.body.cancha} ya está reservada para el ${req.fechaReserva.toLocaleDateString()} a las ${req.body.horario}`
      });
    }

    // Crear reserva de invitado
    const nuevaReserva = new Reserva({
      cancha: req.body.cancha,
      fecha: req.fechaReserva,
      horario: req.body.horario,
      metodoPago: req.body.metodoPago,
      tipo: 'invitado',
      estado: 'pendiente',
      datosInvitado: {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono || null
      }
    });

    await nuevaReserva.save();

    if (nuevaReserva.datosInvitado && nuevaReserva.datosInvitado.email) {
  await sendReservationEmail({
    to: nuevaReserva.datosInvitado.email,
    reservationId: nuevaReserva._id,
    courtName: nuevaReserva.cancha,
    date: nuevaReserva.fecha,
    time: nuevaReserva.horario,
    actionType: 'initial'
  });
}

    // Respuesta sin Mercado Pago (temporalmente comentado)
    return res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        id: nuevaReserva._id,
        cancha: nuevaReserva.cancha,
        fecha: nuevaReserva.fecha,
        horario: nuevaReserva.horario,
        nombre: nuevaReserva.datosInvitado.nombre,
        estado: nuevaReserva.estado
      }
      // payment_url: null // Puedes agregar esto si lo necesitas
    });

    /*
    // Código de Mercado Pago (comentado temporalmente)
    const mpResponse = await fetch('http://localhost:4000/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cancha: nuevaReserva.cancha,
        precio: calcularPrecio(nuevaReserva.cancha),
        reservaId: nuevaReserva._id.toString()
      })
    });

    if (!mpResponse.ok) {
      throw new Error('Error al conectar con Mercado Pago');
    }

    const { payment_url } = await mpResponse.json();

    return res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        id: nuevaReserva._id,
        cancha: nuevaReserva.cancha,
        fecha: nuevaReserva.fecha,
        horario: nuevaReserva.horario,
        nombre: nuevaReserva.datosInvitado.nombre
      },
      payment_url
    });
    */

  } catch (error) {
    console.error('Error en crearReservaInvitado:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la reserva'
    });
  }
};

// Exportar el middleware de validación
export { validarReserva };

export const getAllReservasForAdmin = async (req, res) => {
  try {
    const reservas = await Reserva.find({}).populate('usuario', 'username email');
    // If you also need to populate guest details and they are stored in a separate linked model:
    // .populate('datosInvitado', 'nombre email telefono');
    // However, based on the provided `crearReservaInvitado`, `datosInvitado` is embedded.
    // So, they will be included by default if `Reserva.find({})` is used.

    res.json(reservas);
  } catch (error) {
    console.error('Error en getAllReservasForAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener todas las reservas para el administrador',
      error: error.message,
    });
  }
};