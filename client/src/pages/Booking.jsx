import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import socket from "../socket";
import FaceVerify from "../components/FaceVerify";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const DURATIONS = [1, 2, 3, 4, 6, 12, 24];
const METHODS = [
  { key: "bkash", label: "বিকাশ", icon: "b" },
  { key: "nagad", label: "নগদ", icon: "N" },
  { key: "rocket", label: "রকেট", icon: "R" },
  { key: "upay", label: "Upay", icon: "U" },
  { key: "card", label: "কার্ড", icon: "💳" },
  { key: "cash", label: "ক্যাশ", icon: "💵" },
];
const MERCHANT_NUMBER = "01712-345678";

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 slot, 2 vehicle, 3 payment, 4 done
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(1);

  const [vehicle, setVehicle] = useState({ vehicleNumber: "", vehicleType: "car", ownerName: "", phone: "" });
  const [faceVerified, setFaceVerified] = useState(false);

  const [method, setMethod] = useState("bkash");
  const [payerNumber, setPayerNumber] = useState("");
  const [txnId, setTxnId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/slots").then((res) => setSlots(res.data));
    socket.on("slotsUpdate", (updated) => setSlots(updated));
    return () => socket.off("slotsUpdate");
  }, []);

  const total = selectedSlot ? selectedSlot.rate * duration : 0;

  const goToVehicleStep = () => {
    if (!selectedSlot) return setError("একটি স্লট নির্বাচন করুন");
    setError("");
    setStep(2);
  };

  const goToPaymentStep = (e) => {
    e.preventDefault();
    if (!vehicle.vehicleNumber || !vehicle.ownerName || !vehicle.phone) {
      return setError("সব ঘর পূরণ করুন");
    }
    if (!faceVerified) return setError("ফেস ভেরিফিকেশন সম্পন্ন করুন");
    setError("");
    setStep(3);
  };

  const confirmPayment = async () => {
    if (!user) {
      setError("পেমেন্ট করার আগে লগইন করুন");
      return navigate("/login");
    }
    try {
      const res = await api.post("/bookings", {
        slotId: selectedSlot.slotId,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        ownerName: vehicle.ownerName,
        phone: vehicle.phone,
        faceVerified,
        durationHours: duration,
        paymentMethod: method,
        transactionId: method === "cash" ? "" : txnId || card.number.slice(-4),
      });
      setResult(res.data.booking);
      setStep(4);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "বুকিং ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="page booking-page">
      <div className="step-indicator">
        <span className={step >= 1 ? "done" : ""}>{step > 1 ? "✓" : "১"} স্লট</span>
        <span className={step >= 2 ? "done" : ""}>{step > 2 ? "✓" : "২"} গাড়ি</span>
        <span className={step >= 3 ? "done" : ""}>{step > 3 ? "✓" : "৩"} পেমেন্ট</span>
        <span className={step >= 4 ? "done" : ""}>৪ সম্পন্ন</span>
      </div>

      {error && <p className="error-text">{error}</p>}

      {step === 1 && (
        <section>
          <h2>🅿️ পার্কিং স্লট নির্বাচন</h2>
          <div className="slot-grid">
            {slots.map((s) => (
              <button
                key={s.slotId}
                disabled={s.status === "booked"}
                className={`slot-tile ${s.status} ${selectedSlot?.slotId === s.slotId ? "selected" : ""}`}
                onClick={() => setSelectedSlot(s)}
              >
                {s.slotId}
              </button>
            ))}
          </div>
          <div className="duration-row">
            <p>⏱️ কতক্ষণ পার্ক করবেন?</p>
            <div className="duration-options">
              {DURATIONS.map((d) => (
                <button key={d} className={`chip ${duration === d ? "active" : ""}`} onClick={() => setDuration(d)}>
                  {d} ঘণ্টা
                </button>
              ))}
            </div>
          </div>
          <div className="summary-box">
            <p>স্লট রেট: ৳ {selectedSlot?.rate || 50}/ঘণ্টা</p>
            <p>সময়কাল: {duration} ঘণ্টা</p>
            <p>মোট: ৳ {total}</p>
          </div>
          <button className="btn btn-primary" onClick={goToVehicleStep}>পরবর্তী: গাড়ির তথ্য →</button>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>🚗 গাড়ির তথ্য</h2>
          <form onSubmit={goToPaymentStep} className="vehicle-form">
            <label>নম্বর প্লেট</label>
            <input value={vehicle.vehicleNumber} onChange={(e) => setVehicle({ ...vehicle, vehicleNumber: e.target.value })} required />
            <label>গাড়ির ধরন</label>
            <select value={vehicle.vehicleType} onChange={(e) => setVehicle({ ...vehicle, vehicleType: e.target.value })}>
              <option value="car">🚗 সাধারণ গাড়ি</option>
              <option value="suv">🚙 SUV / মাইক্রোবাস</option>
              <option value="bike">🏍️ মোটরসাইকেল</option>
              <option value="truck">🚛 ট্রাক / পিকআপ</option>
            </select>
            <label>মালিকের নাম</label>
            <input value={vehicle.ownerName} onChange={(e) => setVehicle({ ...vehicle, ownerName: e.target.value })} required />
            <label>ফোন নম্বর</label>
            <input value={vehicle.phone} onChange={(e) => setVehicle({ ...vehicle, phone: e.target.value })} required />

            <FaceVerify onVerified={setFaceVerified} />

            <div className="row-actions">
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← পেছনে</button>
              <button type="submit" className="btn btn-primary">পরবর্তী: পেমেন্ট →</button>
            </div>
          </form>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>💳 পেমেন্ট করুন</h2>
          <div className="order-summary">
            <p>📍 স্লট: {selectedSlot?.slotId}</p>
            <p>⏱️ সময়কাল: {duration} ঘণ্টা</p>
            <p>🚗 গাড়ি: {vehicle.vehicleNumber}</p>
            <p>👤 মালিক: {vehicle.ownerName}</p>
            <p>💰 মোট: ৳ {total}</p>
          </div>

          <div className="method-row">
            {METHODS.map((m) => (
              <button key={m.key} className={`chip ${method === m.key ? "active" : ""}`} onClick={() => setMethod(m.key)}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {["bkash", "nagad", "rocket", "upay"].includes(method) && (
            <div className="mfs-box">
              <p>Send Money করুন নিচের নম্বরে</p>
              <p>মার্চেন্ট নম্বর: <strong>{MERCHANT_NUMBER}</strong></p>
              <p>পাঠাতে হবে: ৳ {total}</p>
              <label>আপনার নম্বর</label>
              <input value={payerNumber} onChange={(e) => setPayerNumber(e.target.value)} />
              <label>Transaction ID (TrxID)</label>
              <input value={txnId} onChange={(e) => setTxnId(e.target.value)} />
            </div>
          )}

          {method === "card" && (
            <div className="card-box">
              <input placeholder="কার্ড নম্বর" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              <input placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
              <input placeholder="CVV" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              <input placeholder="কার্ড হোল্ডারের নাম" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            </div>
          )}

          {method === "cash" && (
            <div className="cash-box">
              <p>💵 বুকিং কনফার্ম হবে। পার্কিং কাউন্টারে এসে QR কোড দেখিয়ে ক্যাশ দিন।</p>
              <p>📍 কাউন্টার লোকেশন: গেট A, লেভেল ১</p>
              <p>⏰ পেমেন্ট টাইম: প্রবেশের আগে</p>
            </div>
          )}

          <div className="row-actions">
            <button className="btn btn-outline" onClick={() => setStep(2)}>← পেছনে</button>
            <button className="btn btn-primary" onClick={confirmPayment}>💳 পেমেন্ট নিশ্চিত করুন</button>
          </div>
        </section>
      )}

      {step === 4 && result && (
        <section className="success-section">
          <h2>🎉 বুকিং সফল!</h2>
          <p>আপনার পার্কিং স্লট নিশ্চিত করা হয়েছে</p>
          <div className="order-summary">
            <p>🆔 বুকিং আইডি: {result._id}</p>
            <p>🅿️ স্লট: {result.slotId}</p>
            <p>🚗 গাড়ি: {result.vehicleNumber}</p>
            <p>⏱️ সময়কাল: {result.durationHours} ঘণ্টা</p>
            <p>💰 পেমেন্ট: ৳ {result.total}</p>
            <p>💳 পদ্ধতি: {result.paymentMethod}</p>
          </div>
          <div className="qr-box">
            <QRCodeSVG value={JSON.stringify({ bookingId: result._id, slot: result.slotId })} size={160} />
            <p>Smart Parking BD — Slot: {result.slotId}</p>
          </div>
          <div className="row-actions">
            <Link className="btn btn-outline" to="/my-bookings">📋 আমার বুকিং</Link>
            <button className="btn btn-primary" onClick={() => { setStep(1); setResult(null); setSelectedSlot(null); }}>+ নতুন বুকিং</button>
          </div>
        </section>
      )}
    </div>
  );
}
