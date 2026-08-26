import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">🅿️ Smart Parking BD</div>
      <div className="nav-links">
        <Link to="/">🏠 হোম</Link>
        <Link to="/booking">📅 বুকিং</Link>
        <Link to="/my-bookings">🎫 আমার বুকিং</Link>
        <Link to="/live-map">📡 লাইভ ম্যাপ</Link>
        <Link to="/admin">⚙️ অ্যাডমিন</Link>
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span>👤 {user.fullName}</span>
            <button onClick={logout}>লগআউট</button>
          </>
        ) : (
          <Link to="/login">🔐 লগইন</Link>
        )}
      </div>
    </nav>
  );
}
