import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
  cancha: { type: String, required: true },
  fecha: { type: Date, required: true },
  horario: { type: String, required: true },
  metodoPago: { type: String, required: true },
  tipo: { type: String, enum: ['usuario', 'invitado'], required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  datosInvitado: {
    nombre: { type: String },
    email: { 
      type: String,
      match: [/.+\@.+\..+/, 'Por favor ingresa un email válido']
    },
    telefono: { type: String }
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmada', 'cancelada'], 
    default: 'pendiente' 
  },
  firstReminderSent: { type: Boolean, default: false },
  finalReminderSent: { type: Boolean, default: false },
  lastActionAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Reserva', reservaSchema);