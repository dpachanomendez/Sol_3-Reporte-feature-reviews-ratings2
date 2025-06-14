import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function PagoPaypal() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado para feedback visual
  const navigate = useNavigate();
  const paypalScriptRef = useRef();

  // Configuración reutilizable
  const API_URL = "http://localhost:4000"; // Considera usar variables de entorno

  useEffect(() => {
    // Verificar datos de reserva
    const reservaTemp = localStorage.getItem("reservaTemp");
    if (!reservaTemp) {
      setError("No se encontraron datos de reserva. Completa el formulario primero.");
      setLoading(false);
      return;
    }

    // Evitar recarga del SDK
    if (window.paypal) {
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${encodeURIComponent('AT2mrQoioTghJOUgXSvGstQU9ekSu0YpDprVfpu0flg9MagJ0Mff56YVirrf5RyAEYhEhq8x1Kuw6S_l')}&currency=USD`;
    script.async = true;
    paypalScriptRef.current = script;

    script.onload = () => {
      setLoading(false);
      if (!window.paypal) {
        setError("Error al cargar PayPal");
        return;
      }

      try {
        window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            height: 45
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: "1.00",
                  currency_code: "USD",
                  breakdown: {
                    item_total: {
                      value: "1.00",
                      currency_code: "USD"
                    }
                  }
                },
                description: "PlayNow Service"
              }],
              application_context: {
                shipping_preference: "NO_SHIPPING"
              }
            });
          },
          onApprove: async (data, actions) => {
            setIsProcessing(true);
            try {
              await actions.order.capture();
              
              const reservaTemp = JSON.parse(localStorage.getItem("reservaTemp"));
              console.log("Datos de reserva:", reservaTemp); // Debug

              if (!reservaTemp) {
                throw new Error("No se encontraron datos de reserva");
              }

              // Validación de campos críticos
              if (!reservaTemp.fecha || !reservaTemp.horario || !reservaTemp.cancha) {
                throw new Error("Datos de reserva incompletos");
              }

              const token = localStorage.getItem('token');
              const endpoint = token ? '/api/reservas' : '/api/reservas/invitado';
              
              // Preparar datos para el backend
              const reservaData = {
                ...reservaTemp,
                fecha: new Date(reservaTemp.fecha).toISOString(), // Formato ISO para MongoDB
                metodoPago: "paypal",
                // Asegurar nombres de campos coincidan con el modelo
                canchaId: reservaTemp.cancha // Si el modelo usa canchaId
              };

              console.log("Enviando al backend:", reservaData); // Debug

              const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  ...(token && { 'Authorization': `Bearer ${token}` }) 
                },
                body: JSON.stringify(reservaData)
              });

              const responseData = await response.json();
              console.log("Respuesta del backend:", responseData); // Debug

              if (!response.ok) {
                throw new Error(responseData.message || "Error al guardar la reserva");
              }

              // Éxito: limpiar y redirigir
              localStorage.removeItem("reservaTemp");
              navigate("/mis-reservas", { 
                state: { 
                  success: "¡Reserva y pago completados!" 
                } 
              });

            } catch (err) {
              console.error("Error en el proceso:", err);
              setError(err.message || "Error al procesar la reserva");
              navigate("/reserva", { 
                state: { 
                  error: "Pago completado pero falló la reserva. Intenta nuevamente." 
                } 
              });
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (err) => {
            console.error("Error de PayPal:", err);
            setError("Error durante el pago con PayPal");
          }
        }).render("#paypal-button-container");
      } catch (err) {
        console.error("Error al crear botones:", err);
        setError("Error al inicializar PayPal");
      }
    };

    script.onerror = () => {
      setLoading(false);
      setError("Error al cargar el SDK de PayPal");
    };

    document.body.appendChild(script);

    return () => {
      if (paypalScriptRef.current?.parentNode) {
        document.body.removeChild(paypalScriptRef.current);
      }
    };
  }, [navigate]);

  return (
    <div className="paypal-container">
      {loading && <p>Cargando PayPal...</p>}
      {isProcessing && (
        <div className="processing-message">
          <p>Procesando pago y reserva...</p>
        </div>
      )}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      )}
      <div id="paypal-button-container" style={{ minHeight: '45px' }}></div>
      
      <div className="sandbox-notice">
        <small>MODO PRUEBA: Usa credenciales de prueba de PayPal</small>
      </div>
    </div>
  );
}