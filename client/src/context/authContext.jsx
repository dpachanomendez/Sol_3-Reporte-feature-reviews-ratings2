import { useEffect } from "react";
import { createContext, useContext, useState } from "react";
// Removed adminLoginRequest from imports
import { loginRequest, registerRequest, verifyTokenRequest } from "../api/axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Unified user state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // clear errors after 5 seconds
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      if (res.status === 200) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error.response?.data);
      setErrors(error.response?.data?.message || ["Error en el registro"]);
    }
  };

  const signin = async (userData) => { // Renamed parameter to avoid conflict
    try {
      const res = await loginRequest(userData);
      if (res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
      setErrors(error.response?.data?.message || ["Error en el login"]);
    }
  };

  // const adminSignin = async (data) => { // REMOVED
  //   try {
  //     const res = await adminLoginRequest(data); // Call API
  //     if (res.data) {
  //       setUser(res.data); // Set user with role
  //       setIsAuthenticated(true);
  //       setErrors([]);
  //       return true;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     setErrors(error.response?.data?.message || ["Invalid admin credentials"]);
  //     setUser(null);
  //     setIsAuthenticated(false);
  //     return false;
  //   }
  // };

  // adminLogout is not needed anymore as logout handles all users

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkLogin = async () => {
      const cookies = Cookies.get();
      if (!cookies.token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await verifyTokenRequest(cookies.token);
        console.log(res);
        if (!res.data) {
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
        setUser(res.data);
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        signin,
        logout,
        isAuthenticated,
        errors,
        loading,
        // adminSignin, // Expose adminSignin -- REMOVED
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;