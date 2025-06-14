import { startSchedulers } from '../jobs/notificationScheduler.js';

// Función para inicializar el sistema de notificaciones
export const initNotifications = () => {
  try {
    startSchedulers();
    console.log('Sistema de notificaciones iniciado correctamente');
  } catch (error) {
    console.error('Error al iniciar el sistema de notificaciones:', error);
  }
};

export default initNotifications;