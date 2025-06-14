import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/authContext';

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchReviews = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await axios.get('/reviews', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // Asegurarnos de que siempre trabajamos con un array
      const reviewsData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray(response.data?.data) 
          ? response.data.data 
          : [];
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setMessage('Error al cargar las reseñas. Inténtalo de nuevo más tarde.');
      setReviews([]); // Aseguramos que sea un array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;
    
    try {
      await axios.delete(`/reviews/${reviewId}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      setMessage('Reseña eliminada correctamente');
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error.response?.data);
      setMessage(error.response?.data?.message || 'No tienes permiso para eliminar esta reseña');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (rating === 0) {
      setMessage('Por favor, selecciona una calificación.');
      return;
    }
    if (!comment.trim()) {
      setMessage('Por favor, escribe un comentario.');
      return;
    }
    if (!isAuthenticated && !name.trim()) {
      setMessage('Por favor, ingresa tu nombre o inicia sesión para dejar una reseña.');
      return;
    }

    const reviewData = {
      rating,
      comment: comment.trim(),
    };

    if (isAuthenticated && user && user.id) {
      reviewData.user = user.id;
    } else if (name.trim()) {
      reviewData.name = name.trim();
    } else {
      setMessage('Se requiere nombre o estar autenticado para enviar la reseña.');
      return;
    }

    try {
      await axios.post('/reviews', reviewData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setMessage('¡Reseña enviada con éxito!');
      setComment('');
      setRating(0);
      setName('');
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error.response?.data);
      setMessage(error.response?.data?.message || 'Error al enviar la reseña. Inténtalo de nuevo.');
    }
  };

  const getDisplayName = (review) => {
    if (review.user?.fullName) return review.user.fullName;
    if (review.user?.username) return review.user.username;
    if (review.name) return review.name;
    return 'Anónimo';
  };

  // Función segura para obtener las reseñas a mostrar
  const getSafeReviews = () => {
    try {
      return Array.isArray(reviews) ? reviews : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">Reseñas y Valoraciones</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Deja tu Reseña</h2>
        {message && (
          <p className={`mb-4 ${
            message.includes('Error') || message.includes('permiso') || message.includes('No tienes') 
              ? 'text-red-500' 
              : 'text-green-500'
          }`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nombre:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={isAuthenticated ? "Tu nombre de usuario se mostrará automáticamente" : "Tu nombre"}
              disabled={isAuthenticated}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Calificación:</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} focus:outline-none transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">
              Comentario:
            </label>
            <textarea
              id="comment"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Escribe tu reseña aquí..."
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Enviar Reseña
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Comentarios de Nuestros Usuarios</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando reseñas...</p>
          </div>
        ) : getSafeReviews().length === 0 ? (
          <p className="text-gray-600 text-center py-4">Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <div className="space-y-6">
            {getSafeReviews().map((review) => (
              <div key={review._id || Math.random()} className="border-b border-gray-200 pb-4 last:border-b-0 group hover:bg-gray-50 rounded-lg px-4 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-lg mr-3 text-gray-800">
                        {getDisplayName(review)}
                      </h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span 
                            key={star} 
                            className={`text-xl ${star <= (review.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{review.comment || ''}</p>
                    <p className="text-xs text-gray-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Fecha no disponible'}
                    </p>
                  </div>
                  
                  {(user?.isAdmin || user?.id === review.user?._id) && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors ml-4"
                      title="Eliminar reseña"
                      aria-label="Eliminar reseña"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && message.includes('Error al cargar') && (
          <p className="text-red-500 text-center py-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ReviewsPage;