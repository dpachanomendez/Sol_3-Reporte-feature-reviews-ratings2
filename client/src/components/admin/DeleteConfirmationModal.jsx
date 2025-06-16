import React from 'react';
import { Button, Card } from '../ui'; // Assuming these are suitable

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Confirm Deletion</h2>
          <Button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</Button>
        </div>
        <p className="mb-6">
          Are you sure you want to delete the reservation for <span className="font-semibold">{itemName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
