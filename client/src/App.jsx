import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import AddUserPage from "./pages/AddUserPage.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import InvoicePage from "./pages/InvoicePage.jsx";
import HousekeeperPage from "./pages/HousekeeperPage.jsx";
import LightBillPage from "./pages/LightBillPage.jsx";
import ServerDownPage from "./pages/ServerDownPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterOrgPage from "./pages/RegisterOrgPage.jsx";
import RegisterMemberPage from "./pages/RegisterMemberPage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import NavUserMenu from "./components/NavUserMenu.jsx";
import { useAuth } from "./auth/useAuth.js";
import {
  API_DOWN_EVENT,
  SERVER_DOWN_PATH,
  isServerMarkedDown,
  pingHealthSilently,
} from "./api.js";
import "./App.css";

function UtilitiesMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const utilitiesActive =
    location.pathname.startsWith("/housekeeper") ||
    location.pathname.startsWith("/light-bill");

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="nav-dropdown" ref={menuRef}>
      <button
        type="button"
        className={`nav-dropdown-trigger ${open || utilitiesActive ? "active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Utilities
      </button>
      {open ? (
        <div className="nav-dropdown-menu" role="menu" aria-label="Utilities">
          <NavLink
            to="/housekeeper"
            className="nav-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            HouseKeeper
          </NavLink>
          <NavLink
            to="/light-bill"
            className="nav-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Light bill
          </NavLink>
        </div>
      ) : null}
    </div>
  );
}

function NavAuth() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="nav-auth">
        <Link to="/login" className="nav-link-plain">
          Log in
        </Link>
        <Link to="/register" className="btn btn-sm primary">
          Register
        </Link>
      </div>
    );
  }
  return (
    <div className="nav-auth">
      <NavUserMenu />
    </div>
  );
}

function navOrganizationLabel(u) {
  if (!u) return "";
  if (u.organizationKind === "user") return "PERSONAL";
  const n = typeof u.organizationName === "string" ? u.organizationName.trim() : "";
  if (n) return n;
  if (u.organizationKind === "flat_pg") return "Flat / PG";
  return "";
}

function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const orgLabel = navOrganizationLabel(user);

  return (
    <div className="app app-glass">
      <header className="nav nav-glass">
        <div className="nav-brand-block">
          <Link to="/" className="brand">
            Flat Expense
          </Link>
          {orgLabel ? (
            <span className="nav-org-name" title={orgLabel}>
              {orgLabel}
            </span>
          ) : null}
        </div>
        <div className="nav-tools">
          <nav className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/order">Order</NavLink>
            <NavLink to="/history">History</NavLink>
            <UtilitiesMenu />
            <NavLink to="/invoice">Invoice</NavLink>
            {isAdmin ? (
              <NavLink to="/users">Users</NavLink>
            ) : null}
          </nav>
          <NavAuth />
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedLayout() {
  return (
    <RequireAuth>
      <Layout />
    </RequireAuth>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function goServerDown() {
      if (location.pathname === SERVER_DOWN_PATH) return;
      navigate(SERVER_DOWN_PATH, { replace: true });
    }

    if (isServerMarkedDown()) {
      goServerDown();
    }

    window.addEventListener(API_DOWN_EVENT, goServerDown);
    return () => window.removeEventListener(API_DOWN_EVENT, goServerDown);
  }, [location.pathname, navigate]);

  useEffect(() => {
    void pingHealthSilently();
    const id = setInterval(() => {
      void pingHealthSilently();
    }, 600_000);
    return () => clearInterval(id);
  }, []);

  if (location.pathname === SERVER_DOWN_PATH) {
    return (
      <Routes>
        <Route path={SERVER_DOWN_PATH} element={<ServerDownPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterOrgPage />} />
      <Route path="/register/member" element={<RegisterMemberPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/new" element={<AddUserPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/housekeeper" element={<HousekeeperPage />} />
        <Route path="/light-bill" element={<LightBillPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path={SERVER_DOWN_PATH} element={<ServerDownPage />} />
      </Route>
    </Routes>
  );
}
