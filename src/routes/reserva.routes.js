import express from 'express';
import { check } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  crearReserva,
  crearReservaInvitado,
  validarReserva,
  getAllReservasForAdmin,
  updateReservaAdmin,
  deleteReservaAdmin // Import the delete function
} from '../controllers/reserva.controller.js';
import { confirmReserva, cancelReserva } from '../controllers/notificationAction.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { exportReservasCSV } from '../controllers/reservaReport.controller.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

const actionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiadas solicitudes, intente más tarde'
});

// Rutas principales
router.post('/', auth, validarReserva, crearReserva);
router.post('/invitado', validarReserva, crearReservaInvitado);

// Rutas de notificaciones
router.put(
  '/:id/confirm',
  [
    check('id').isMongoId(),
    actionLimiter
  ],
  confirmReserva
);

router.put(
  '/:id/cancel',
  [
    check('id').isMongoId(),
    actionLimiter
  ],
  cancelReserva
);

router.get('/reporte/csv', auth, requireAdmin, exportReservasCSV);

// New route for admin to get all reservations
router.get("/alladmin", auth, requireAdmin, getAllReservasForAdmin);

// New route for admin to update any reservation
router.put(
  "/admin/:id",
  auth,
  requireAdmin,
  [check('id', 'ID de reserva inválido').isMongoId()],
  updateReservaAdmin
);

// New route for admin to delete any reservation
router.delete(
  "/admin/:id",
  auth,
  requireAdmin,
  [check('id', 'ID de reserva inválido').isMongoId()],
  deleteReservaAdmin
);

export default router;