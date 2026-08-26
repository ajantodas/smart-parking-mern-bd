import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.get("/bookings/my").then((res) => setBookings(res.data)).catch(() => {});
  }, [user]);

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
    } catch (err) {
      setError(err.response?.data?.message || "বাতিল করা যায়নি");
    }
  };

  if (!user) {
    return <div className="page"><p>আপনার বুকিং দেখতে লগইন করুন।</p></div>;
  }

  const filtered = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "active") return b.status === "active";
    if (filter === "cancelled") return b.status === "cancelled" || b.status === "completed";
    return true;
  });

  return (
    <div className="page">
      <h2>📋 আমার বুকিং</h2>
      {error && <p className="error-text">{error}</p>}
      <div className="filter-row">
        <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>সব</button>
        <button className={`chip ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>সক্রিয়</button>
        <button className={`chip ${filter === "cancelled" ? "active" : ""}`} onClick={() => setFilter("cancelled")}>বাতিল/সম্পন্ন</button>
      </div>

      <div className="bookings-list">
        {filtered.length === 0 && <p>কোনো বুকিং পাওয়া যায়নি।</p>}
        {filtered.map((b) => (
          <div key={b._id} className="booking-card">
            <p>🅿️ স্লট: {b.slotId} | 🚗 {b.vehicleNumber}</p>
            <p>⏱️ {b.durationHours} ঘণ্টা | 💰 ৳ {b.total} | {b.paymentMethod}</p>
            <p>স্ট্যাটাস: <span className={`status-tag ${b.status}`}>{b.status}</span></p>
            {b.status === "active" && (
              <button className="btn btn-outline" onClick={() => cancelBooking(b._id)}>বাতিল করুন</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
