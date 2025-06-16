import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Card } from '../ui'; // Assuming these are suitable

export function EditReservationModal({ reservation, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Initialize formData when the modal opens or the reservation data changes
    if (reservation) {
      setFormData({
        fecha: reservation.fecha ? new Date(reservation.fecha).toISOString().split('T')[0] : '',
        horario: reservation.horario || '',
        cancha: reservation.cancha || '',
        estado: reservation.estado || 'pendiente',
        datosInvitado: {
          nombre: reservation.datosInvitado?.nombre || '',
          email: reservation.datosInvitado?.email || '',
          telefono: reservation.datosInvitado?.telefono || '',
        },
        metodoPago: reservation.metodoPago || '',
      });
    }
  }, [reservation, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("datosInvitado.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        datosInvitado: {
          ...prev.datosInvitado,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Construct the data to be sent, ensuring datosInvitado is structured if fields were empty initially
    const payload = {
      ...formData,
      datosInvitado: {
        nombre: formData.datosInvitado.nombre,
        email: formData.datosInvitado.email,
        telefono: formData.datosInvitado.telefono,
      }
    };
    onSave(payload);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Edit Reservation</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fecha">Fecha:</Label>
            <Input type="date" name="fecha" id="fecha" value={formData.fecha || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="horario">Horario:</Label>
            <Input type="text" name="horario" id="horario" value={formData.horario || ''} onChange={handleChange} placeholder="e.g., 10:00 - 11:00" />
          </div>
          <div>
            <Label htmlFor="cancha">Cancha:</Label>
            <Input type="text" name="cancha" id="cancha" value={formData.cancha || ''} onChange={handleChange} placeholder="e.g., Fútbol 1" />
          </div>
          <div>
            <Label htmlFor="estado">Estado:</Label>
            <select name="estado" id="estado" value={formData.estado || 'pendiente'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <Label htmlFor="metodoPago">Método de Pago:</Label>
            <Input type="text" name="metodoPago" id="metodoPago" value={formData.metodoPago || ''} onChange={handleChange} placeholder="e.g., Efectivo, Tarjeta" />
          </div>
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-medium">Datos del Invitado (si aplica)</legend>
            <div>
              <Label htmlFor="datosInvitado.nombre">Nombre Invitado:</Label>
              <Input type="text" name="datosInvitado.nombre" id="datosInvitado.nombre" value={formData.datosInvitado?.nombre || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="datosInvitado.email">Email Invitado:</Label>
              <Input type="email" name="datosInvitado.email" id="datosInvitado.email" value={formData.datosInvitado?.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="datosInvitado.telefono">Teléfono Invitado:</Label>
              <Input type="tel" name="datosInvitado.telefono" id="datosInvitado.telefono" value={formData.datosInvitado?.telefono || ''} onChange={handleChange} />
            </div>
          </fieldset>
          <div className="flex justify-end space-x-3">
            <Button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black">Cancel</Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
