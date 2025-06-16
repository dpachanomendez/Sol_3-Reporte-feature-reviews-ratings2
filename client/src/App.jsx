import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AuthProvider } from "./context/authContext";
import { ProtectedRoute } from "./routes";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import HomePageLog from "./pages/HomePageLog";
import ReservaForm from "./pages/Reserva";
import PagoPaypal from "./pages/PagoPaypal"; // ✅ Nueva importación
import ReporteReservas from "./pages/ReporteReservas";
import ReviewsPage from "./pages/ReviewsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage"; // <-- Import Dashboard
import { AdminProtectedRoute } from "./routes/AdminProtectedRoute"; // <-- Import AdminProtectedRoute

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <main className="container content-container mx-auto px-10 md:px-0">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/soporte" element={<h1>Soporte PlayNow</h1>} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Rutas Protegidas para Usuarios Logueados */}
              <Route element={<ProtectedRoute />}>
                <Route path="/reserva" element={<ReservaForm />} />
                <Route path="/profile" element={<h1>Profile</h1>} />
                <Route path="/home" element={<HomePageLog />} />
              </Route>

              {/* Rutas Protegidas para Administradores */}
              <Route element={<AdminProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                {/* You can add more admin routes here, e.g., /admin/users, /admin/settings */}
                {/* If ReporteReservas is an admin-only page, move it here */}
                <Route path="/reporte-reservas" element={<ReporteReservas />} />
              </Route>
              
              <Route path="/pago-paypal" element={<PagoPaypal />} />
            </Routes>
          </main>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
