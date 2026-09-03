import { Routes, Route, useLocation } from "react-router-dom";
import { useContext, useEffect, lazy, Suspense } from "react";
// Ro'yhatdan o'tmaganlar uchun
const Login = lazy(() => import("./pages/nouser/Login"));
const Register = lazy(() => import("./pages/nouser/Register"));
const Home = lazy(() => import("./pages/nouser/Home"));


// Authenficatsiyanni tekshirish uchun
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Logindan o'tganlar uchun


// Navbar yoki sidebar uchun
import Navbar from "./components/Navbar";
import NavbarUser from "./components/NavbarUser";


// Noto'gri url bo'lsa chiqadi
const NoPage = lazy(() => import("./pages/NoPage"));

// style berish uchun
import './index.css';
import './style/main.css';
import { SearchProvider } from "./context/SearchContext";
// import User from "./router/User";
const User = lazy(() => import("./router/User"));
const Admin = lazy(() => import("./router/Admin"));
const NoUser = lazy(() => import("./router/NoUser"));
// import Admin from "./router/Admin";
// import NoUser from "./router/NoUser";
const Logout = lazy(() => import("./pages/user/Logout"));

function App() {


  return (
    <AuthProvider>
      <ThemeProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  let { token, role } = useContext(AuthContext);
  console.log('role=>', role);

  return (
    <>
      {
        token ? (
          role?.role == 'user' ? <NavbarUser></NavbarUser> : null
        )
          :
          <Navbar></Navbar>
      }
      {/* {
        role?.role == 'user' ? (
          token ? <NavbarUser /> : <Navbar />
        ) : null
      } */}
      <main className={token ? (role?.role == 'user' ? "user-layout-main" : 'admin_panel') : ""}>
        {
          token ? (
            role?.role == 'user' ? (
              <User></User>
            )
              :
              // (null)
              (<Admin></Admin>)
          )
            :
            (<NoUser></NoUser>)
        }
      </main>
    </>
  );
}

export default App;