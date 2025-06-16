import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Message, Button, Input, Label } from "../components/ui";
import { loginSchema } from "../schemas/auth";

export function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  // Use standard signin, isAuthenticated, user, and errors
  const { signin, isAuthenticated, user, errors: loginErrors } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    await signin(data); // Use standard signin
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'administrador') {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="h-[calc(100vh-100px)] flex items-center justify-center">
      <Card>
        {loginErrors && loginErrors.map((error, i) => (
          <Message message={error} key={i} />
        ))}
        <h1 className="text-2xl font-bold">Admin Login</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Label htmlFor="email">Email:</Label>
          <Input
            label="Escribe tu email"
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            {...register("email", { required: true })}
          />
          <p>{errors.email?.message}</p>

          <Label htmlFor="password">Contraseña:</Label>
          <Input
            type="password"
            name="password"
            placeholder="Escribe tu contraseña"
            {...register("password", { required: true, minLength: 6 })}
          />
          <p>{errors.password?.message}</p>

          <Button>Iniciar Sesión</Button>
        </form>
      </Card>
    </div>
  );
}
