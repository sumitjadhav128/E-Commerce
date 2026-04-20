import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../utils/api";
import "../css/AdminDashboard.css";
import AdminAnalytics from "./AdminAnalytics";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${API_URL}/api/admin/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 403) {
          alert("Admin access only");
          navigate("/");
        }
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
   <div className="admin-dashboard">

  <h1 className="dashboard-title">Admin Dashboard</h1>

  <div className="stats-grid">

    <div className="stat-card">
      <h4>Total Users</h4>
      <p>{data.totalUsers}</p>
    </div>

    <div className="stat-card">
      <h4>Total Products</h4>
      <p>{data.totalProducts}</p>
    </div>

    <div className="stat-card">
      <h4>Total Orders</h4>
      <p>{data.totalOrders}</p>
    </div>

    <div className="stat-card">
      <h4>Total Revenue</h4>
      <p>₹{data.totalRevenue}</p>
    </div>

    <div className="stat-card">
      <h4>Paid Orders</h4>
      <p>{data.paidOrders}</p>
    </div>

    <div className="stat-card">
      <h4>Pending Orders</h4>
      <p>{data.pendingOrders}</p>
    </div>

  </div>

<AdminAnalytics> </AdminAnalytics>

</div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px",
  width: "300px"
};

export default AdminDashboard;