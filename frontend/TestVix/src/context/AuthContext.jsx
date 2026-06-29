import { createContext, useState, useEffect } from "react";
import { verify_token } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Yuklanish holati

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await verify_token();
        // Backend status: false qaytarsa tokeni o'chirib tashlaymiz        
        if (res && res.status !== false) {          
            setToken(res);
        } else {
            setToken(null);
        }
      } catch (err) {
        setToken(null);
      } finally {
        setLoading(false); // Tekshiruv tugadi
      }
    };
    checkAuth();
  }, []);

  const login = (token) => {
    // localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    // localStorage.removeItem("token");
    setToken(null);
  };

  // Tekshiruv tugamaguncha hech narsani ko'rsatmaymiz (yoki Spinner ko'rsatish mumkin)
  if (loading) return null; 

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};