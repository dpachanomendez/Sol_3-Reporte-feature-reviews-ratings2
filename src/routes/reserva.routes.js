import express from 'express';
import { check } from 'express-validator';
import rateLimit from 'express-rate-limit';
import {
  crearReserva,
  crearReservaInvitado,
  validarReserva
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


export default router;