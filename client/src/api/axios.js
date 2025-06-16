
import axios from "axios";
import { API_URL } from "../config";

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Funciones que usan la instancia configurada
export const registerRequest = async (user) =>
  instance.post(`/auth/register`, user);

export const loginRequest = async (user) => 
  instance.post(`/auth/login`, user);

export const verifyTokenRequest = async () => 
  instance.get(`/auth/verify`);

// export const adminLoginRequest = (user) => instance.post('/auth/admin/login', user); // REMOVED

export const getAllReservationsAdminRequest = () => instance.get('/reservas/alladmin');

export const updateReservationAdminRequest = (id, data) => instance.put(`/reservas/admin/${id}`, data);

export const deleteReservationAdminRequest = (id) => instance.delete(`/reservas/admin/${id}`);

export default instance;
