import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
import Layout from "../components/layout";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const features = [
  { icon: "📊", title: "Real-Time Monitoring", description: "Voltage, current & power" },
  { icon: "🔐", title: "Encrypted Data", description: "End-to-end protection" },
  { icon: "👁️", title: "Anomaly Detection", description: "Suspicious pattern alerts" },
  { icon: "✓", title: "Integrity Verified", description: "Tamper-proof readings" },
];

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();

  // Handle email/password signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeToTerms) {
      alert("You must agree to the terms and privacy policy.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const db = getFirestore();

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        createdAt: new Date()
      });

      console.log("Signup successful:", user.email);
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
  };

  // Handle Google signup/login
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google auth successful:", user.email);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google auth error:", error.message);
      alert(error.message);
    }
  };

  return (
    <Layout>
      <div className="h-screen w-screen flex overflow-hidden">
        {/* Left - Features */}
        <div className="hidden md:flex flex-col flex-1 p-8 overflow-hidden bg-card text-card-foreground">
          <Header />
          <div className="flex flex-col justify-between h-full">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Smart energy monitoring, secured
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Track real-time electrical consumption, detect anomalies, and predict energy costs with enterprise-grade security.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 flex flex-col items-start"
                >
                  <div className="text-3xl md:text-4xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{f.title}</h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Signup Form */}
        <div className="flex flex-1 justify-center items-start bg-card text-card-foreground">
          <div className="w-full max-w-md px-6 md:px-8 py-8 md:py-10 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-bold mb-1 text-foreground">Create account</h2>
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              Join WattWise and start monitoring your energy
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0"
                    style={{ background: "none", border: "none", outline: "none", boxShadow: "none", appearance: "none" }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0"
                    style={{ background: "none", border: "none", outline: "none", boxShadow: "none", appearance: "none" }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="font-medium !text-green-700 hover:!text-green-800">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="font-medium !text-green-700 hover:!text-green-800">Privacy Policy</a>
                </span>
              </div>

              <button
                type="submit"
                className="w-full !bg-green-600 hover:!bg-green-700 text-white font-semibold py-2 md:py-2.5 rounded-lg transition-colors duration-200"
              >
                Create account
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-3">
              <hr className="flex-1 border-border" />
              <span className="mx-2 text-muted-foreground text-sm">Or continue with</span>
              <hr className="flex-1 border-border" />
            </div>

            {/* Google Signup/Login */}
            <button
              onClick={handleGoogleAuth}
              className="w-full border border-border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-foreground font-medium">Google</span>
            </button>

            {/* Sign In */}
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="font-medium !text-green-700 hover:!text-green-800">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}