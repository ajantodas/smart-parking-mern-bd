import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>📝 রেজিস্ট্রেশন</h2>
        {error && <p className="error-text">{error}</p>}
        <label>👤 পূর্ণ নাম</label>
        <input value={form.fullName} onChange={update("fullName")} required />
        <label>📱 ফোন নম্বর</label>
        <input value={form.phone} onChange={update("phone")} required />
        <label>📧 ইমেইল (ঐচ্ছিক)</label>
        <input value={form.email} onChange={update("email")} />
        <label>🔑 পাসওয়ার্ড</label>
        <input type="password" value={form.password} onChange={update("password")} required />
        <button type="submit" className="btn btn-primary">রেজিস্ট্রেশন করুন →</button>
      </form>
    </div>
  );
}
