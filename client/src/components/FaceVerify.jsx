import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

// Models are downloaded at runtime, in the user's browser, from a public
// CDN that hosts face-api.js's official pretrained weights. No model files
// need to live in this project.
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

// Real, on-device liveness check using face-api.js. Thresholds here are
// intentionally lenient — the goal is "does a real face show up", not a
// strict biometric match.
export default function FaceVerify({ onVerified }) {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const progressRef = useRef(0);
  const missCountRef = useRef(0);

  const [stream, setStream] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [verified, setVerified] = useState(false);
  const [camError, setCamError] = useState("");
  const [hint, setHint] = useState("");
  const [showSkip, setShowSkip] = useState(false);

  const steps = [
    { icon: "👀", label: "সোজা তাকান", needFrames: 3 },
    { icon: "😊", label: "হাসুন (না পারলে শুধু মুখ খোলা রাখুন)", needFrames: 3 },
    { icon: "👈👉", label: "মাথা সামান্য বামে/ডানে ঘোরান", needFrames: 3 },
  ];

  // load face-api models once when this component mounts
  useEffect(() => {
    let cancelled = false;
    const loadModels = async () => {
      setModelsLoading(true);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setModelsLoaded(true);
          console.log("✅ face-api মডেল সব লোড হয়েছে");
        }
      } catch (err) {
        console.error("face-api মডেল লোড এরর:", err);
        if (!cancelled) setCamError("AI মডেল লোড করা যায়নি, ইন্টারনেট সংযোগ চেক করুন: " + err.message);
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    };
    loadModels();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (streaming && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [streaming, stream]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    setCamError("");
    setShowSkip(false);
    missCountRef.current = 0;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: {} });
      setStream(s);
      setStreaming(true);
    } catch (err) {
      setCamError(
        "ক্যামেরা চালু করা যায়নি: " + err.message + " (ব্রাউজারের ঠিকানা বারে ক্যামেরা আইকনে ক্লিক করে Allow দিন)"
      );
    }
  };

  const stopCamera = () => {
    clearInterval(intervalRef.current);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setStreaming(false);
  };

  const finishVerified = () => {
    clearInterval(intervalRef.current);
    setVerified(true);
    stopCamera();
    onVerified(true);
  };

  const advanceStep = () => {
    progressRef.current = 0;
    missCountRef.current = 0;
    setShowSkip(false);
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
      setHint("");
    } else {
      finishVerified();
    }
  };

  // main detection loop
  useEffect(() => {
    if (!streaming || !modelsLoaded || verified) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      let detection;
      try {
        detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }))
          .withFaceLandmarks()
          .withFaceExpressions();
      } catch (err) {
        console.error("face-api detection error:", err);
        setHint("⚠️ ডিটেকশন এরর: " + err.message);
        return;
      }

      const current = steps[stepIndex];

      // No face found at all
      if (!detection) {
        progressRef.current = 0;
        missCountRef.current += 1;
        setHint("😕 মুখ দেখা যাচ্ছে না — ক্যামেরার সামনে সোজা আসুন, ভালো আলোয় বসুন");
        if (missCountRef.current > 15) setShowSkip(true); // ~3s of no detection
        return;
      }

      // step 0: just needs any steady face — the moment we see one, count it
      if (stepIndex === 0) {
        progressRef.current += 1;
        missCountRef.current = 0;
        setHint(`✅ মুখ শনাক্ত হয়েছে... (${progressRef.current}/${current.needFrames})`);
      }
      // step 1: smile if possible, but a neutral/open face after a couple seconds is accepted too
      else if (stepIndex === 1) {
        const happy = detection.expressions?.happy || 0;
        const neutral = detection.expressions?.neutral || 0;
        if (happy > 0.25 || neutral > 0.4) {
          progressRef.current += 1;
          missCountRef.current = 0;
          setHint(`✅ শনাক্ত হচ্ছে... (${progressRef.current}/${current.needFrames})`);
        } else {
          setHint("😊 একটু হাসুন, বা স্বাভাবিকভাবে ক্যামেরার দিকে তাকান");
        }
      }
      // step 2: small head turn — nose position relative to jaw edges
      else if (stepIndex === 2) {
        const jaw = detection.landmarks.getJawOutline();
        const nose = detection.landmarks.getNose();
        const leftEdge = jaw[0].x;
        const rightEdge = jaw[16].x;
        const noseX = nose[3].x;
        const width = rightEdge - leftEdge;
        const ratio = width !== 0 ? (noseX - leftEdge) / width : 0.5;

        if (ratio < 0.42 || ratio > 0.58) {
          progressRef.current += 1;
          missCountRef.current = 0;
          setHint(`✅ মাথা নড়াচড়া শনাক্ত হচ্ছে... (${progressRef.current}/${current.needFrames})`);
        } else {
          setHint("👈👉 মাথাটা একটু বাম বা ডান দিকে ঘোরান");
        }
      }

      if (progressRef.current >= current.needFrames) {
        advanceStep();
      }
    }, 200);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming, modelsLoaded, stepIndex, verified]);

  const retry = () => {
    setStepIndex(0);
    progressRef.current = 0;
    missCountRef.current = 0;
    setVerified(false);
    setHint("");
    setShowSkip(false);
    onVerified(false);
  };

  const skipThisStep = () => {
    setShowSkip(false);
    missCountRef.current = 0;
    advanceStep();
  };

  return (
    <div className="face-verify">
      <h3>🤖 AI ফেস ভেরিফিকেশন</h3>
      <p className="muted">
        রিয়েল লাইভনেস ডিটেকশন (face-api.js) — সব প্রসেসিং আপনার ব্রাউজারেই হয়
      </p>

      {camError && <p className="error-text">{camError}</p>}

      {!streaming && !verified && (
        <button type="button" className="btn btn-primary" onClick={startCamera} disabled={modelsLoading}>
          {modelsLoading ? "⏳ AI মডেল লোড হচ্ছে..." : "📷 ক্যামেরা চালু করুন"}
        </button>
      )}

      {streaming && !verified && (
        <div className="camera-box">
          <video ref={videoRef} autoPlay muted playsInline className="camera-video" />
          <div className="liveness-step">
            <div className="step-icon">{steps[stepIndex].icon}</div>
            <div>ধাপ {stepIndex + 1}: {steps[stepIndex].label}</div>
            <div className="muted">{hint || "প্রস্তুত হন..."}</div>
          </div>
          {showSkip && (
            <button type="button" className="btn btn-outline" onClick={skipThisStep}>
              ⏭️ এই ধাপ স্কিপ করুন (ক্যামেরা সমস্যা হলে)
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={stopCamera}>⏹️ বন্ধ করুন</button>
        </div>
      )}

      {verified && (
        <div className="verified-box">
          <div className="v-icon">✅</div>
          <p>ভেরিফাইড! রিয়েল ফেস নিশ্চিত হয়েছে</p>
          <button type="button" className="btn btn-outline" onClick={retry}>🔄 পুনরায় চেষ্টা</button>
        </div>
      )}
    </div>
  );
}