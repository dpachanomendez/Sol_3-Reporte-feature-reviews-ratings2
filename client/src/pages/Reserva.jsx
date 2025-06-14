import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function ReservaForm() {
  const [formData, setFormData] = useState({
    fecha: "",
    horario: "",
    cancha: "",
    metodoPago: "efectivo",
    nombre: "",
    email: "",
    telefono: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const horasDisponibles = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
    "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00",
    "20:00-21:00", "21:00-22:00"
  ];

  const tiposCancha = [
    { id: "futbol", nombre: "Cancha de Fútbol" },
    { id: "tennis", nombre: "Cancha de Tenis" },
    { id: "basketball", nombre: "Cancha de Baloncesto" }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMensaje("");
  };

  const validarCampos = () => {
    const camposRequeridos = ["nombre", "email", "fecha", "horario", "cancha"];
    const faltantes = camposRequeridos.filter(campo => !formData[campo]);
    
    if (faltantes.length > 0) {
      setMensaje("❌ Por favor completa todos los campos obligatorios");
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMensaje("❌ Ingresa un correo electrónico válido");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!validarCampos()) return;

    if (formData.metodoPago === 'paypal') {
      try {
        const fechaValida = new Date(formData.fecha);
        if (isNaN(fechaValida.getTime())) {
          throw new Error("Fecha inválida");
        }

        const reservaTemp = {
          ...formData,
          canchaId: formData.cancha,
          fecha: fechaValida.toISOString()
        };

        localStorage.setItem("reservaTemp", JSON.stringify(reservaTemp));
        navigate("/pago-paypal");
      } catch (error) {
        console.error("Error al preparar datos para PayPal:", error);
        setMensaje(`❌ ${error.message || "Error al procesar la reserva"}`);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const fechaReserva = new Date(formData.fecha);
      if (isNaN(fechaReserva.getTime())) throw new Error("Fecha inválida");

      const token = localStorage.getItem('token');
      const endpoint = token ? '/api/reservas' : '/api/reservas/invitado';
      
      const reservaData = {
        ...formData,
        canchaId: formData.cancha,
        fecha: fechaReserva.toISOString(),
        metodoPago: "efectivo"
      };

      console.log("Enviando reserva:", reservaData);

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        body: JSON.stringify(reservaData)
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la reserva");
      }

      setMensaje("✅ Reserva creada exitosamente!");
      setFormData({
        fecha: "", horario: "", cancha: "", metodoPago: "efectivo",
        nombre: "", email: "", telefono: ""
      });

      setTimeout(() => navigate('/mis-reservas'), 2000);
    } catch (error) {
      console.error("[ERROR]", error);
      setMensaje(`❌ ${error.message || "Error al procesar la reserva"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4 text-black">
      <h2 className="text-xl font-bold">Reservar Cancha</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block">Nombre completo</label>
          <input 
            type="text" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
            required 
          />
        </div>
        
        <div>
          <label className="block">Correo electrónico</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
            required 
          />
        </div>
        
        <div>
          <label className="block">Teléfono</label>
          <input 
            type="tel" 
            name="telefono" 
            value={formData.telefono} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
          />
        </div>
        
        <div>
          <label className="block">Fecha</label>
          <input 
            type="date" 
            name="fecha" 
            value={formData.fecha} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
            required 
          />
        </div>
        
        <div>
          <label className="block">Horario</label>
          <select 
            name="horario" 
            value={formData.horario} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
            required
          >
            <option value="">Selecciona un horario</option>
            {horasDisponibles.map((hora) => (
              <option key={hora} value={hora}>{hora}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block">Tipo de Cancha</label>
          <select 
            name="cancha" 
            value={formData.cancha} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded" 
            required
          >
            <option value="">Selecciona una cancha</option>
            {tiposCancha.map((cancha) => (
              <option key={cancha.id} value={cancha.id}>{cancha.nombre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block">Método de pago</label>
          <select 
            name="metodoPago" 
            value={formData.metodoPago} 
            onChange={handleChange} 
            disabled={isSubmitting} 
            className="w-full p-2 border rounded"
          >
            <option value="efectivo">Efectivo</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : "Reservar"}
        </button>
      </form>
      
      {mensaje && (
        <div className={`mt-2 text-center ${
          mensaje.includes("✅") ? "text-green-600" : "text-red-500"
        }`}>
          {mensaje}
        </div>
      )}
    </div>
  );
}