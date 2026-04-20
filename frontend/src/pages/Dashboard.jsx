import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import "../css/Dashboard.css";


function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }
     
  //  const API_URL = "http://192.168.183.196:5000";

    fetch(`${API_URL}/api/auth/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 400) {
          localStorage.removeItem("token");
          navigate("/");
        }
        return res.json();
      })
      .then(data => {
        setMessage(data.message);
      });
  }, []);

  return (
   <div className="dashboard">
  <div className="dashboard-card">

    {/* <h1 className="dashboard-title">{message}</h1> */}

    <div className="dashboard-actions">
      <button
        className="btn primary"
        onClick={() => navigate("/cart")}
      >
        My Cart
      </button>

      <button
        className="btn primary"
        onClick={() => navigate("/orders")}
      >
        My Orders
      </button>

      <button
        className="btn logout"
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>

  </div>
</div>
  );
}

export default Dashboard;
