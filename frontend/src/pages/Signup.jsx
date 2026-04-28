import { useState } from "react";
import API_URL from "../utils/api";
import "../css/Signup.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Real-time border logic
  const passwordTouched = form.password.length > 0;
  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = form.password === confirmPassword;

  const getPasswordBorderClass = () => {
    if (!passwordTouched) return "";
    return form.password.length >= 6 ? "input-valid" : "input-error";
  };

  const getConfirmBorderClass = () => {
    if (!confirmTouched) return "";
    return passwordsMatch ? "input-valid" : "input-error";
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setLoading(false);

   if (response.ok) {
 toast.success("Registered successfully!");
  navigate("/");
} else {
  alert(data.message); // shows "Email already exists" etc.
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
        <h1 className="auth-title">Create account</h1>

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Your name</label>
            <input
              id="name"
              className="auth-input"
              name="name"
              placeholder="First and last name"
              onChange={handleChange}
              required
            />
          </div>

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
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                className={`auth-input ${getPasswordBorderClass()}`}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
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
            {passwordTouched && form.password.length < 6 && (
              <p className="auth-hint auth-hint-error">
                ✗ Password must be at least 6 characters.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirmPassword">Re-enter password</label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                className={`auth-input ${getConfirmBorderClass()}`}
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {confirmTouched && (
              <p className={`auth-hint ${passwordsMatch ? "auth-hint-success" : "auth-hint-error"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Submit — disabled if mismatch */}
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading || (confirmTouched && !passwordsMatch)}
          >
            {loading ? "Creating account..." : "Create your account"}
          </button>

        </form>

        <p className="auth-terms">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="auth-link">Conditions of Use</a> and{" "}
          <a href="/privacy" className="auth-link">Privacy Notice</a>.
        </p>
      </div>

      {/* Divider */}
      <div className="auth-divider">
        <span>Already have an account?</span>
      </div>

      {/* Sign in */}
      <div className="auth-card auth-card-secondary">
        <a href="/" className="auth-btn-secondary">Sign in</a>
      </div>

    </div>
  );
}

export default Signup;