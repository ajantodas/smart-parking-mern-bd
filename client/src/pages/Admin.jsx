import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("spb_admin_token") || "");
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/admin-login", creds);
      localStorage.setItem("spb_admin_token", res.data.token);
      setToken(res.data.token);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  const logout = () => {
    localStorage.removeItem("spb_admin_token");
    setToken("");
  };

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadAll = async () => {
    const [statsRes, slotsRes, bookingsRes] = await Promise.all([
      api.get("/bookings/admin/stats", authHeader),
      api.get("/slots"),
      api.get("/bookings/admin/all", authHeader),
    ]);
    setStats(statsRes.data);
    setSlots(slotsRes.data);
    setBookings(bookingsRes.data);
  };

  useEffect(() => {
    if (!token) return;
    loadAll().catch((err) => {
      console.error("Admin loadAll error:", err.response?.status, err.response?.data, err.message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("অ্যাডমিন টোকেন মেয়াদোত্তীর্ণ বা অবৈধ — আবার লগইন করুন");
        logout();
      } else {
        setError(
          "ডেটা লোড করা যায়নি: " +
            (err.response?.data?.message || err.message) +
            " — ব্যাকএন্ড সার্ভার (npm run dev, server ফোল্ডারে) চালু আছে কিনা চেক করুন"
        );
      }
    });
    socket.on("slotsUpdate", (updated) => setSlots(updated));
    socket.on("newBooking", () => loadAll());
    return () => {
      socket.off("slotsUpdate");
      socket.off("newBooking");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetAllSlots = async () => {
    await api.post("/slots/reset-all", {}, authHeader);
    loadAll();
  };

  const exportCSV = () => {
    const header = "BookingID,Slot,Vehicle,Owner,Phone,Duration,Total,Method,Status,Date\n";
    const rows = bookings
      .map((b) =>
        [b._id, b.slotId, b.vehicleNumber, b.ownerName, b.phone, b.durationHours, b.total, b.paymentMethod, b.status, new Date(b.createdAt).toLocaleString()].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart-parking-bookings.csv";
    a.click();
  };

  if (!token) {
    return (
      <div className="page auth-page">
        <form className="auth-form" onSubmit={login}>
          <h2>🔐 অ্যাডমিন প্যানেল</h2>
          {error && <p className="error-text">{error}</p>}
          <label>ইউজারনেম</label>
          <input value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })} />
          <label>পাসওয়ার্ড</label>
          <input type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} />
          <button className="btn btn-primary" type="submit">অ্যাডমিন লগইন →</button>
          <p className="muted">ডেমো: admin / admin123 (.env এ পরিবর্তনযোগ্য)</p>
        </form>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="row-actions">
        <h2>📊 অ্যাডমিন ড্যাশবোর্ড</h2>
        <div>
          <button className="btn btn-outline" onClick={exportCSV}>📊 Export CSV</button>
          <button className="btn btn-outline" onClick={logout}>লগআউট</button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {stats && (
        <div className="stats-row wrap">
          <div className="stat-card"><div className="stat-num">{stats.totalSlots}</div><div className="stat-label">মোট স্লট</div></div>
          <div className="stat-card green"><div className="stat-num">{stats.emptySlots}</div><div className="stat-label">খালি স্লট</div></div>
          <div className="stat-card red"><div className="stat-num">{stats.bookedSlots}</div><div className="stat-label">বুক্ড</div></div>
          <div className="stat-card"><div className="stat-num">৳ {stats.todayRevenue}</div><div className="stat-label">আজকের আয়</div></div>
          <div className="stat-card"><div className="stat-num">{stats.totalBookings}</div><div className="stat-label">মোট বুকিং</div></div>
          <div className="stat-card"><div className="stat-num">{stats.totalUsers}</div><div className="stat-label">মোট ইউজার</div></div>
        </div>
      )}

      <section>
        <div className="row-actions">
          <h3>🅿️ স্লট ম্যানেজমেন্ট</h3>
          <button className="btn btn-outline" onClick={resetAllSlots}>🔄 সব খালি</button>
        </div>
        <div className="slot-grid">
          {slots.map((s) => (
            <div key={s.slotId} className={`slot-tile ${s.status}`}>{s.slotId}</div>
          ))}
        </div>
      </section>

      <section>
        <h3>📋 বুকিং লিস্ট</h3>
        <div className="bookings-list">
          {bookings.length === 0 && <p>প্রক্রিয়া করা হচ্ছে...</p>}
          {bookings.map((b) => (
            <div key={b._id} className="booking-card">
              <p>🅿️ {b.slotId} | 🚗 {b.vehicleNumber} | 👤 {b.ownerName} | 📱 {b.phone}</p>
              <p>⏱️ {b.durationHours}ঘ | 💰 ৳{b.total} | {b.paymentMethod} | <span className={`status-tag ${b.status}`}>{b.status}</span></p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}