import { createContext, useState, useEffect } from "react";
import { verify_token } from "../api/auth";
import { useNavigate } from "react-router-dom";
// import { AuthContext } from "./AuthCreate";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Yuklanish holati
  const [role, setRole] = useState({})

  useEffect(() => {
    // setToken(true)
    // setRole({ 'role': 'admin' })
    const checkAuth = async () => {
      try {
        const res = await verify_token();
        // Backend status: false qaytarsa tokeni o'chirib tashlaymiz

        if (res && res.status !== false) {
          // Token obyekt sifatida saqlaymiz, lekin keyin cookie'dan foydalanamiz
          setToken(res);
          setRole(res.user)


        } else {
          setToken(null);
          setRole(false)
          navigate('/')


        }
      } catch (err) {
        setToken(null);
        setRole(false)
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

  const handleRole = (data) => {
    setRole(data)
  }

  return (

    <AuthContext.Provider value={{ token, role, login, logout, handleRole }}>
      {children}
    </AuthContext.Provider>
  );
};