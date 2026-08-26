import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { phone, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "লগইন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>🔐 লগইন</h2>
        {error && <p className="error-text">{error}</p>}
        <label>📱 ফোন নম্বর</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <label>🔑 পাসওয়ার্ড</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn btn-primary">লগইন করুন →</button>
        <p>নতুন? <Link to="/register">রেজিস্ট্রেশন করুন</Link></p>
      </form>
    </div>
  );
}
