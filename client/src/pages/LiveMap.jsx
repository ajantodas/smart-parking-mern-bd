import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function LiveMap() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api.get("/slots").then((res) => setSlots(res.data));
    socket.on("slotsUpdate", (updated) => setSlots(updated));
    return () => socket.off("slotsUpdate");
  }, []);

  const empty = slots.filter((s) => s.status === "empty").length;
  const booked = slots.filter((s) => s.status === "booked").length;
  const occupancy = slots.length ? Math.round((booked / slots.length) * 100) : 0;

  const zones = ["A", "B", "C"];

  return (
    <div className="page live-map-page">
      <h2>📡 রিয়েল-টাইম পার্কিং ম্যাপ <span className="live-badge">LIVE</span></h2>
      <p>সবুজ = খালি | লাল = বুক্ড | যেকোনো ডিভাইস থেকে বুকিং করলে সবার স্ক্রিনে আপডেট হবে</p>

      <div className="stats-row">
        <div className="stat-card green"><div className="stat-num">{empty}</div><div className="stat-label">খালি</div></div>
        <div className="stat-card red"><div className="stat-num">{booked}</div><div className="stat-label">বুক্ড</div></div>
        <div className="stat-card"><div className="stat-num">{occupancy}%</div><div className="stat-label">অকুপেন্সি</div></div>
      </div>

      {zones.map((zone) => (
        <div key={zone} className="zone-block">
          <h3>Zone {zone} 🚦</h3>
          <div className="slot-grid">
            {slots
              .filter((s) => s.zone === zone)
              .map((s) => (
                <div key={s.slotId} className={`slot-tile ${s.status}`}>
                  {s.slotId}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
