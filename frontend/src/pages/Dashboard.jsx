import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function Dashboard() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:5000/api/auth/dashboard", {
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
    <div>
      <h1>{message}</h1>
      <button onClick={() => {
        localStorage.removeItem("token");
        navigate("/");
      }}>
        Logout
      </button>

      <button onClick={() => navigate("/orders")}>
  My Orders
</button>
    </div>
  );
}

export default Dashboard;
