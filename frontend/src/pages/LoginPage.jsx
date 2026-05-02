import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
import Layout from "../components/layout";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";


const features = [
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <path d="M4 22 L10 14 L16 18 L22 10 L28 16 L32 12" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "Real-Time Monitoring",
    description: "Voltage, current & power",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <circle cx="18" cy="13" r="6" stroke="#1a7a45" strokeWidth="2"/>
        <path d="M10 28C10 23.58 13.58 20 18 20C22.42 20 26 23.58 26 28" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <rect x="14" y="28" width="8" height="4" rx="1" fill="#1a7a45"/>
      </svg>
    ),
    title: "Encrypted Data",
    description: "End-to-end protection",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <circle cx="18" cy="18" r="8" stroke="#1a7a45" strokeWidth="2"/>
        <circle cx="18" cy="18" r="3" fill="#1a7a45"/>
        <line x1="18" y1="4" x2="18" y2="8" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="28" x2="18" y2="32" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4" y1="18" x2="8" y2="18" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
        <line x1="28" y1="18" x2="32" y2="18" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Anomaly Detection",
    description: "Suspicious pattern alerts",
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <rect x="10" y="16" width="16" height="14" rx="2" stroke="#1a7a45" strokeWidth="2"/>
        <path d="M14 16V12C14 9.79 15.79 8 18 8C20.21 8 22 9.79 22 12V16" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M15 23L17 25L21 21" stroke="#1a7a45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Integrity Verified",
    description: "Tamper-proof readings",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      return alert("Please enter a valid email");
    }

    if (!password || password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const token = await user.getIdToken();
      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col flex-1 p-8 overflow-hidden bg-gray-50 dark:bg-[#1e1f22] border-r border-gray-200 dark:border-gray-700">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 bg-[#1a7a45] rounded-[10px] flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M13 2L4.5 13.5H11L10 22L20.5 10.5H14L13 2Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">WattWise</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
            Smart energy<br />monitoring, secured
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-sm">
            Track real-time electrical consumption, detect anomalies, and predict energy costs with enterprise-grade security.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3 flex-1 content-start">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[#e8f5ee] dark:bg-[#1a2e22] border border-[#b2d8c0] dark:border-[#2a4a37] rounded-2xl p-4 md:p-5 flex flex-col items-start"
              >
                <div className="mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-1 justify-center items-center bg-white dark:bg-[#18191b]">
          <div className="w-full max-w-md px-8 py-8">

            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-400 mb-7">
              Sign in to access your energy dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1.5 4L8 9L14.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#25262a] text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/30 focus:border-[#1a7a45] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium !text-[#1a7a45] hover:!text-green-800 no-underline">
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5.5 7V5.5C5.5 4.12 6.62 3 8 3C9.38 3 10.5 4.12 10.5 5.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#25262a] text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/30 focus:border-[#1a7a45] transition-colors"
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0"
                    style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full !bg-[#1a7a45] hover:!bg-[#155e36] text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm"
              >
                Sign in
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <hr className="flex-1 border-gray-200 dark:border-gray-700" />
              <span className="mx-3 text-xs text-gray-400">Or continue with</span>
              <hr className="flex-1 border-gray-200 dark:border-gray-700" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 dark:border-gray-600 py-3 rounded-xl flex items-center justify-center gap-2.5 hover:bg-gray-50 dark:hover:bg-[#25262a] transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>

            {/* Sign Up */}
            <p className="mt-5 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold !text-[#1a7a45] hover:!text-green-800 no-underline"
              >
                Sign Up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </Layout>
  );
}