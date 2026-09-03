import { useState, useContext } from "react";
import { loginUser } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import FonColor from "../../components/ui/FonColor";

export default function Login() {
  const { login, handleRole } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser({ username, password });
    if (res.status) {
      handleRole(res.user)
      login(true);
      localStorage.setItem('user', JSON.stringify(res.user))
      navigate('/');
    } else {
      setMessage(res.message);
    }
  };

  return (
    <div className="login-page">
      <FonColor lightColor="#279af8" darkColor="#054298" top_y={-100} left_x={-150} wd={300} ht={300} />
      <FonColor lightColor="#6366f1" darkColor="#312e81" top_y={400} left_x={400} wd={300} ht={300} />

      <div className="login-card">
        <div className="login-header">
          <Link to="/" className="back-link">← Orqaga</Link>
          <h1>Xush kelibsiz</h1>
          <p>Bilimingizni sinashda davom eting</p>
        </div>
        <p className="log_message">{message}</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              placeholder="Username"
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Parol</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '35px' }}
              />
              <i
                className={`eye-icon-style bi ${showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                onClick={() => setShowPassword(!showPassword)}></i>
            </div>
          </div>
          <button className="btn btn-primary w-full">Kirish</button>
        </form>

        <div className="login-footer">
          <p>Accountingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link></p>
        </div>
      </div>
    </div>
  );
}