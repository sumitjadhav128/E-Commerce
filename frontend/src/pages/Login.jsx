import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   const API_URL = "http://192.168.183.196:5000";

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
       localStorage.setItem("userId", data.userId);
      navigate("/products");
    } else {
      alert(data.message);
    }
  };

   //signup
  function signup() {
 navigate("/signup")
  }

  return (
   <form onSubmit={handleSubmit} className="handleLogin">
  <h2 className="loginTitle">Welcome Back</h2>

  <div className="inputGroup">
    <input
      name="email"
      type="email"
      placeholder="Email"
      onChange={handleChange}
    />
  </div>

  <div className="inputGroup">
    <input
      name="password"
      type="password"
      placeholder="Password"
      onChange={handleChange}
    />
  </div>

  <button type="submit" className="loginBtn">Login</button>

  <p className="extraText">
    Don't have an account? <span><button type="button" onClick={signup}>Sign up</button></span>
  </p>
</form>
  );
}

export default Login;
