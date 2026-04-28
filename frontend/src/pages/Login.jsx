import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import toast from "react-hot-toast";
import "../css/Login.css";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setLoading(false);

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      toast.success("Welcome back!");
      navigate("/products");
    } else {
      toast.error(data.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">

      {/* Logo */}
      <div className="auth-logo">
        <span className="auth-logo-text">Nexkart</span>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="password">Password</label>
              <a href="/forgot-password" className="auth-link auth-forgot">Forgot password?</a>
            </div>
            <div className="auth-input-wrapper">
              <input
                id="password"
                className="auth-input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        <p className="auth-terms">
          By signing in, you agree to our{" "}
          <a href="/terms" className="auth-link">Conditions of Use</a> and{" "}
          <a href="/privacy" className="auth-link">Privacy Notice</a>.
        </p>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>New to Nexkart?</span>
      </div>

      {/* Create account */}
      <div className="auth-card auth-card-secondary">
        <button
          type="button"
          className="auth-btn-secondary"
          onClick={() => navigate("/signup")}
        >
          Create your account
        </button>
      </div>

    </div>
  );
}

export default Login;