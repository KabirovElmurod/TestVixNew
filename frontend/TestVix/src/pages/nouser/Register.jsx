import { useState, useContext } from "react";
import { registerUser, loginUser } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";


function check_password(password) {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}


export default function Register() {
  const { login, handleRole } = useContext(AuthContext);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const {token, login} = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname || !email || !username || !password) {
      setMessage("Barcha maydonlarni to'ldiring!");
      return;
    }

    if (password.length < 8) {
      setMessage("Parol kamida 8 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (!check_password(password)) {
      setMessage("Parol kamida bitta raqam va harfdan iborat bo'lishi kerak!");
      return;
    }
    setMessage("");
    setLoading(true);

    const regRes = await registerUser({ nickname, email, username, password });
    setLoading(false);

    if (!regRes.status && regRes.message) {
      setMessage(regRes.message);
      return;
    }

    if (regRes.status) {
      handleRole(regRes.user)
      login(true);
      localStorage.setItem('user', JSON.stringify(regRes.user))

      // Navigate based on role
      if (regRes.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="login-page" style={{ position: 'relative', top: '30px' }}>

      <div className="login-card" style={{ padding: '20px', margin: '10px auto' }}>
        <div className="login-header" style={{ marginBottom: '12px' }}>
          <h1 style={{ fontSize: '1.4rem', marginTop: '5px' }}>Ro'yxatdan o'tish</h1>
          <p className="log_message">
            {message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ gap: '8px' }}>
          <div className="form-group" style={{ marginBottom: '2px' }}>
            <label>Nickname</label>
            <input
              placeholder="Sizning ismingiz"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2px' }}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2px' }}>
            <label>Username</label>
            <input
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2px' }}>
            <label>Parol</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '35px' }}
              />
              <i
                className={`eye-icon-style bi ${showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>
          
          <button 
            className="btn btn-primary w-full" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Yuklanmoqda...
              </>
            ) : (
              "Ro'yxatdan o'tish"
            )}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '12px' }}>
          <p>Accountingiz bormi? <Link to="/login">Kirish</Link></p>
        </div>
      </div>
    </div>
  );
}