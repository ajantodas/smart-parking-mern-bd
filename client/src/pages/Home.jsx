import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket";

export default function Home() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api.get("/slots").then((res) => setSlots(res.data));
    socket.on("slotsUpdate", (updated) => setSlots(updated));
    return () => socket.off("slotsUpdate");
  }, []);

  const empty = slots.filter((s) => s.status === "empty").length;
  const booked = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="page home">
      <section className="hero">
        <h1>🅿️ স্মার্ট কার পার্কিং BD</h1>
        <p>AI ফেস ভেরিফিকেশন • রিয়েল-টাইম স্লট • মোবাইল পেমেন্ট • মাল্টি-ডিভাইস সিঙ্ক</p>

        <div className="stats-row">
          <div className="stat-card green">
            <div className="stat-icon">🟢</div>
            <div className="stat-num">{empty}</div>
            <div className="stat-label">খালি স্লট</div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon">🔴</div>
            <div className="stat-num">{booked}</div>
            <div className="stat-label">বুক্ড</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🅿️</div>
            <div className="stat-num">{slots.length}</div>
            <div className="stat-label">মোট স্লট</div>
          </div>
        </div>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/booking">🚗 এখনই বুকিং করুন</Link>
          <Link className="btn btn-outline" to="/live-map">📡 লাইভ ম্যাপ দেখুন</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="f-icon">🤖</div>
          <h3>AI ফেস লাইভনেস</h3>
          <p>হাসি ও মাথা ঘোরানো দিয়ে রিয়েল ফেস প্রমাণ</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">💸</div>
          <h3>ইনস্ট্যান্ট পেমেন্ট</h3>
          <p>বিকাশ, নগদ, রকেট — সরাসরি মোবাইলে</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">🗺️</div>
          <h3>মাল্টি-ডিভাইস সিঙ্ক</h3>
          <p>Admin ও User একসাথে লাইভ দেখবে</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">⏱️</div>
          <h3>অটো-এক্সপায়ার</h3>
          <p>মেয়াদ শেষ হলে স্বয়ংক্রিয়ভাবে স্লট খালি</p>
        </div>
      </section>

      <section className="location-card">
        <p>📍 <strong>ঢাকা, গুলশান-১</strong></p>
        <p>🕐 <strong>২৪/৭ খোলা</strong></p>
        <p>🅿️ <strong>{slots.length || 12}টি স্লট</strong></p>
        <p>💳 <strong>ক্যাশলেস পেমেন্ট</strong></p>
      </section>
    </div>
  );
}
