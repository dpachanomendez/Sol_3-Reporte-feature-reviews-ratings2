import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Elegir el conjunto de credenciales
const provider = process.env.EMAIL_PROVIDER || '1';
const emailUser = process.env[`EMAIL_USER_${provider}`];
const emailPass = process.env[`EMAIL_PASS_${provider}`];

// Validación de credenciales
if (!emailUser || !emailPass) {
  console.error('Error: Credenciales de email no configuradas en .env');
  console.log('Por favor configura:');
  console.log(`EMAIL_USER_${provider}, EMAIL_PASS_${provider}, EMAIL_HOST, EMAIL_PORT, EMAIL_FROM`);
  process.exit(1);
}

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false 
  }
});

// Plantillas de email
const emailTemplates = {
  initial: {
    subject: 'Reserva Creada - Confirma tu asistencia',
    verb: 'creada',
    color: '#FFA500',
    showButtons: true
  },
  confirmation: {
    subject: 'Confirmación de Reserva',
    verb: 'confirmada',
    color: '#4CAF50'
  },
  cancellation: {
    subject: 'Cancelación de Reserva',
    verb: 'cancelada',
    color: '#f44336'
  },
  reminder: {
    subject: 'Recordatorio de Reserva',
    verb: 'pendiente',
    color: '#2196F3',
    showButtons: true
  }
};

/**
 * Envía email de reserva
 * @param {Object} params - Datos para el email
 * @returns {Promise<Boolean>} Resultado del envío
 */
export async function sendReservationEmail({ 
  to, 
  reservationId, 
  courtName, 
  date, 
  time, 
  actionType = 'initial' 
}) {
  try {
    const template = emailTemplates[actionType] || emailTemplates.initial;
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${template.color};">Reserva ${template.verb.toUpperCase()}</h2>
        <p><strong>Cancha:</strong> ${courtName}</p>
        <p><strong>Fecha:</strong> ${formattedDate} a las ${time}</p>
        ${template.showButtons ? `
        <div style="margin: 20px 0;">
          <a href="${process.env.APP_URL}/reservas/${reservationId}/confirm" 
             style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; margin-right: 10px;">
            Confirmar
          </a>
          <a href="${process.env.APP_URL}/reservas/${reservationId}/cancel" 
             style="background-color: #f44336; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px;">
            Cancelar
          </a>
        </div>
        ` : ''}
        <p style="font-size: 0.9em; color: #666;">ID: ${reservationId}</p>
      </div>
    `;

    const mailOptions = {
      from: `"PlayNow Reservas" <${process.env.EMAIL_FROM || 'reservas@playnow.com'}>`,
      to,
      subject: `${template.subject} - ${courtName}`,
      html: htmlContent,
      text: `Reserva para ${courtName} el ${formattedDate} a las ${time} (${template.verb}).`
    };

    console.log(`Enviando email a: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado | ID:', info.messageId);
    if (process.env.EMAIL_HOST.includes('ethereal')) {
      console.log('Vista previa:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error enviando email:', error.message);
    return false;
  }
}
