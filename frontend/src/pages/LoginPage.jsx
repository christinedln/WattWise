import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Header from "../components/Header";
import Layout from "../components/layout";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const features = [
  { icon: "📊", title: "Real-Time Monitoring", description: "Voltage, current & power" },
  { icon: "🔐", title: "Encrypted Data", description: "End-to-end protection" },
  { icon: "👁️", title: "Anomaly Detection", description: "Suspicious pattern alerts" },
  { icon: "✓", title: "Integrity Verified", description: "Tamper-proof readings" },
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
        <div className="hidden md:flex flex-col flex-1 p-8 overflow-hidden bg-card text-card-foreground">
          <Header />
          <div className="mt-2 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Smart energy monitoring, secured
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Track real-time electrical consumption, detect anomalies, and predict energy costs with enterprise-grade security.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 flex flex-col items-start">
                  <div className="text-3xl md:text-4xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{f.title}</h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-center items-center bg-card text-card-foreground">
          <div className="w-full max-w-md px-6 md:px-8 py-6 md:py-8 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
              Sign in to access your energy dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <a href="#" className="text-sm !text-green-700 hover:!text-green-800">
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0"
                    style={{
                      background: "none",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      appearance: "none",
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full !bg-green-600 hover:!bg-green-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-colors duration-200"
              >
                Sign in
              </button>
            </form>

            <div className="flex items-center my-4">
              <hr className="flex-1 border-border" />
              <span className="mx-2 text-muted-foreground text-sm">Or continue with</span>
              <hr className="flex-1 border-border" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full border border-border py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-foreground font-medium">Google</span>
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="mt-4 text-center text-sm font-medium !text-green-700 hover:!text-green-800 no-underline"
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