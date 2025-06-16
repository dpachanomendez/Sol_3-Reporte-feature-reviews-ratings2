import React, { useState, useEffect } from 'react';
import {
  getAllReservationsAdminRequest,
  updateReservationAdminRequest,
  deleteReservationAdminRequest // Import delete function
} from '../api/axios';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { EditReservationModal } from '../components/admin/EditReservationModal';
import { DeleteConfirmationModal } from '../components/admin/DeleteConfirmationModal'; // Import delete modal

export function AdminDashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [editingReservation, setEditingReservation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [reservationToDel, setReservationToDel] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await getAllReservationsAdminRequest();
        setReservations(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reservations.');
        console.error("Error fetching reservations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleOpenEditModal = (reservation) => {
    setEditingReservation(reservation);
    setIsEditModalOpen(true);
    setSaveError(null); // Clear previous save errors
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReservation(null);
  };

  const handleSaveEditedReservation = async (updatedData) => {
    if (!editingReservation?._id) {
      console.error("No reservation selected for editing or missing ID.");
      setSaveError("No reservation selected for editing or missing ID.");
      return;
    }
    try {
      const response = await updateReservationAdminRequest(editingReservation._id, updatedData);
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === editingReservation._id ? response.data : res
        )
      );
      handleCloseEditModal();
      // Optionally, add a success toast/notification here
    } catch (err) {
      console.error("Error updating reservation:", err);
      setSaveError(err.response?.data?.message || "Failed to update reservation.");
    }
  };

  const handleOpenDeleteModal = (reservation) => {
    setReservationToDel(reservation);
    setIsDeleteModalOpen(true);
    setDeleteError(null); // Clear previous delete errors
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReservationToDel(null);
  };

  const handleConfirmDelete = async () => {
    if (!reservationToDel?._id) {
      console.error("No reservation selected for deletion or missing ID.");
      setDeleteError("No reservation selected for deletion or missing ID.");
      handleCloseDeleteModal(); // Close modal as something is wrong
      return;
    }
    try {
      await deleteReservationAdminRequest(reservationToDel._id);
      setReservations(prevReservations =>
        prevReservations.filter(res => res._id !== reservationToDel._id)
      );
      handleCloseDeleteModal();
      // Optionally, add a success toast/notification here
    } catch (err) {
      console.error("Error deleting reservation:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete reservation.");
      handleCloseDeleteModal(); // Close modal even on error, error will be displayed below
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading reservations...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard - All Reservations</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {reservations.length === 0 ? (
        <p className="text-center text-gray-500">No reservations found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">User/Guest Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Court</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Time</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Payment Method</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reserva) => (
                <tr key={reserva._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {reserva.usuario?.username || reserva.datosInvitado?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {reserva.usuario?.email || reserva.datosInvitado?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4">{reserva.cancha}</td>
                  <td className="px-6 py-4">
                    {new Date(reserva.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{reserva.horario}</td>
                  <td className="px-6 py-4">{reserva.estado}</td>
                  <td className="px-6 py-4">{reserva.metodoPago || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenEditModal(reserva)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-2"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(reserva)}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditModalOpen && editingReservation && (
        <EditReservationModal
          reservation={editingReservation}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedReservation}
        />
      )}
      {isDeleteModalOpen && reservationToDel && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemName={`reservation for ${reservationToDel.datosInvitado?.nombre || reservationToDel.usuario?.username || 'N/A'} on ${new Date(reservationToDel.fecha).toLocaleDateString()}`}
        />
      )}
      {/* Display save/delete errors if any */}
      {saveError && <p className="text-red-500 text-center mt-2 py-2">{saveError}</p>}
      {deleteError && <p className="text-red-500 text-center mt-2 py-2">{deleteError}</p>}
    </div>
  );
}
